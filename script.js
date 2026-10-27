
/* =====================================================
   HUNGRYZONE - SCRIPT
===================================================== */


/* =====================================================
   PÁGINAS
===================================================== */

const homeLink = document.getElementById("homeLink");
const ordersLink = document.getElementById("ordersLink");
const cartButton = document.getElementById("cartButton");
const profileButton = document.getElementById("profileButton");

const homePage = document.getElementById("homePage");
const ordersPage = document.getElementById("ordersPage");
const cartPage = document.getElementById("cartPage");
const helpPage = document.getElementById("helpPage");


function showPage(page) {

    homePage.classList.remove("active-page");
    ordersPage.classList.remove("active-page");
    cartPage.classList.remove("active-page");
    helpPage.classList.remove("active-page");

    homeLink.classList.remove("active");
    ordersLink.classList.remove("active");


    if (page === "home") {

        homePage.classList.add("active-page");
        homeLink.classList.add("active");

    }


    if (page === "orders") {

        ordersPage.classList.add("active-page");
        ordersLink.classList.add("active");

        renderOrders();

    }


    if (page === "cart") {

        cartPage.classList.add("active-page");

    }

    if (page === "help") {
        helpPage.classList.add("active-page");
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

homeLink.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("home");

});


ordersLink.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("orders");

});


cartButton.addEventListener("click", function() {

    showPage("cart");

    renderCart();

});


profileButton.addEventListener("click", function() {

    openCustomerModal();

});


document.getElementById("helpLink").addEventListener("click", function(event) {
    event.preventDefault();
    showPage("help");
});

// Central de ajuda: perguntas expansíveis, busca e atalhos funcionais.
document.querySelectorAll(".help-question").forEach(function(button) {
    button.addEventListener("click", function() {
        const answer = button.nextElementSibling;
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isOpen));
        answer.classList.toggle("is-open", !isOpen);
        button.querySelector("b").textContent = isOpen ? "＋" : "−";
    });
});

document.querySelectorAll("[data-help-target]").forEach(function(button) {
    button.addEventListener("click", function() {
        const target = document.getElementById(button.dataset.helpTarget);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (button.dataset.helpTarget === "faq") {
            const first = document.querySelector("#faq .help-question");
            if (first && first.getAttribute("aria-expanded") !== "true") first.click();
        }
    });
});

document.querySelectorAll("[data-help-action]").forEach(function(button) {
    button.addEventListener("click", function() {
        const action = button.dataset.helpAction;
        if (action === "home") showPage("home");
        if (action === "orders") showPage("orders");
        if (action === "cart") { showPage("cart"); renderCart(); }
        if (action === "profile") openCustomerModal();
    });
});

const helpSearchInput = document.getElementById("helpSearchInput");
const clearHelpSearch = document.getElementById("clearHelpSearch");
function filterHelp() {
    const query = (helpSearchInput.value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    document.querySelectorAll(".help-section, .help-contact").forEach(function(section) {
        const matches = !query || section.textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(query);
        section.style.display = matches ? "" : "none";
        if (query && matches) section.querySelectorAll(".help-question").forEach(function(q) {
            const answer = q.nextElementSibling;
            const text = (q.textContent + " " + answer.textContent).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            if (text.includes(query)) { q.setAttribute("aria-expanded", "true"); answer.classList.add("is-open"); q.querySelector("b").textContent = "−"; }
        });
    });
}
helpSearchInput.addEventListener("input", filterHelp);
clearHelpSearch.addEventListener("click", function() { helpSearchInput.value = ""; filterHelp(); helpSearchInput.focus(); });

document.getElementById("helpContactForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("helpContactName").value.trim();
    const email = document.getElementById("helpContactEmail").value.trim();
    const message = document.getElementById("helpContactMessage").value.trim();
    const subject = encodeURIComponent("Ajuda HungryZone - " + name);
    const body = encodeURIComponent("Nome: " + name + "\nE-mail para retorno: " + email + "\n\nDúvida: \n" + message);
    document.getElementById("helpFormStatus").textContent = "Seu aplicativo de e-mail será aberto com a mensagem preenchida.";
    window.location.href = "mailto:suporte@hungryzone.com?subject=" + subject + "&body=" + body;
});


/* =====================================================
   CARRINHO
===================================================== */

let cart = JSON.parse(
    localStorage.getItem("hungryzone-cart")
) || [];


/* =====================================================
   ELEMENTOS
===================================================== */

const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const cartCounter = document.getElementById("cartCounter");
const cartItemsText = document.getElementById("cartItemsText");

const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const totalElement = document.getElementById("total");

const continueButton = document.getElementById("continueButton");
const emptyCartButton = document.getElementById("emptyCartButton");
const checkoutButton = document.getElementById("checkoutButton");


/* =====================================================
   FORMATAR DINHEIRO
===================================================== */

function formatPrice(value) {

    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


/* =====================================================
   SALVAR CARRINHO
===================================================== */

function saveCart() {

    localStorage.setItem(
        "hungryzone-cart",
        JSON.stringify(cart)
    );

}


/* =====================================================
   QUANTIDADE
===================================================== */

function getTotalItems() {

    return cart.reduce(function(total, item) {

        return total + item.quantity;

    }, 0);

}


function updateCartCounter() {

    const totalItems = getTotalItems();

    cartCounter.textContent = totalItems;

    cartCounter.classList.remove("pop");

    void cartCounter.offsetWidth;

    cartCounter.classList.add("pop");

}


/* =====================================================
   ADICIONAR AO CARRINHO
===================================================== */

function addToCart(product, customization = {}) {

    const removedIngredients = customization.removedIngredients || [];
    const extras = customization.extras || [];
    const extrasTotal = extras.reduce((sum, extra) => sum + Number(extra.price || 0), 0);
    const finalPrice = Number(product.price) + extrasTotal;
    const cartLineId = product.id + "::" + removedIngredients.slice().sort().join("|") + "::" + extras.map(extra => extra.name).sort().join("|");
    const existingProduct = cart.find(function(item) {

        return (item.cartLineId || item.id) === cartLineId;

    });


    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            id: cartLineId,
            cartLineId: cartLineId,
            productId: product.id,
            name: product.name,
            price: finalPrice,
            basePrice: Number(product.price),
            image: product.image,
            quantity: 1,
            removedIngredients: removedIngredients,
            extras: extras
        });

    }


    saveCart();
    updateCartCounter();
    renderCart();

    showPage("cart");

}


/* =====================================================
   QUANTIDADE DO PRODUTO
===================================================== */

function changeQuantity(id, change) {

    const product = cart.find(function(item) {

        return item.id === id;

    });


    if (!product) {
        return;
    }


    product.quantity += change;


    if (product.quantity <= 0) {

        cart = cart.filter(function(item) {

            return item.id !== id;

        });

    }


    saveCart();
    updateCartCounter();
    renderCart();

}


function removeFromCart(id) {

    cart = cart.filter(function(item) {

        return item.id !== id;

    });


    saveCart();
    updateCartCounter();
    renderCart();

}


/* =====================================================
   RENDERIZAR CARRINHO
===================================================== */

function renderCart() {

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        emptyCart.classList.add("show");

        cartItemsText.textContent = "0 itens";

        subtotalElement.textContent = "R$ 0,00";
        deliveryElement.textContent = "R$ 0,00";
        totalElement.textContent = "R$ 0,00";

        return;

    }


    emptyCart.classList.remove("show");


    const totalItems = getTotalItems();

    cartItemsText.textContent =
        `${totalItems} ${totalItems === 1 ? "item" : "itens"}`;


    let subtotal = 0;


    cart.forEach(function(item) {

        const itemTotal =
            item.price * item.quantity;


        subtotal += itemTotal;


        const element =
            document.createElement("article");


        element.className = "cart-item";


        element.innerHTML = `

            <img
                class="cart-item-image"
                src="${item.image}"
                alt="${item.name}"
            >

            <div class="cart-item-info">

                <h3>
                    ${item.name}
                </h3>

                <span class="cart-item-price">
                    ${formatPrice(item.price)}
                </span>
                ${item.removedIngredients && item.removedIngredients.length ? `<small class="cart-removed-ingredients">Sem: ${item.removedIngredients.join(", ")}</small>` : ""}
                ${item.extras && item.extras.length ? `<small class="cart-added-extras">Extras: ${item.extras.map(extra => `${extra.name} (+${formatPrice(extra.price)})`).join(", ")}</small>` : ""}

            </div>

            <div class="quantity-box">

                <button
                    class="quantity-button"
                    data-action="decrease"
                    data-id="${item.id}"
                    type="button"
                >
                    −
                </button>

                <span class="quantity-number">
                    ${item.quantity}
                </span>

                <button
                    class="quantity-button"
                    data-action="increase"
                    data-id="${item.id}"
                    type="button"
                >
                    +
                </button>

            </div>

            <strong class="cart-item-total">
                ${formatPrice(itemTotal)}
            </strong>

            <button
                class="remove-button"
                data-id="${item.id}"
                type="button"
                title="Remover"
            >
                🗑
            </button>
        `;


        cartItems.appendChild(element);

    });


    const delivery = 5;
    const total = subtotal + delivery;


    subtotalElement.textContent = formatPrice(subtotal);
    deliveryElement.textContent = formatPrice(delivery);
    totalElement.textContent = formatPrice(total);


    document.querySelectorAll(".quantity-button").forEach(function(button) {

        button.addEventListener("click", function() {

            changeQuantity(
                button.dataset.id,
                button.dataset.action === "increase" ? 1 : -1
            );

        });

    });


    document.querySelectorAll(".remove-button").forEach(function(button) {

        button.addEventListener("click", function() {

            removeFromCart(button.dataset.id);

        });

    });

}


/* =====================================================
   CONTINUAR
===================================================== */

continueButton.addEventListener("click", function() {

    showPage("home");

});


emptyCartButton.addEventListener("click", function() {

    showPage("home");

});


/* =====================================================
   CLIENTE / CADASTRO
===================================================== */

const customerOverlay =
    document.getElementById("customerOverlay");

const closeCustomerModal =
    document.getElementById("closeCustomerModal");

const registerForm =
    document.getElementById("registerForm");

const loginForm =
    document.getElementById("loginForm");

const customerError =
    document.getElementById("customerError");


function getCustomer() {

    return JSON.parse(
        localStorage.getItem("hungryzone-customer")
    );

}


function saveCustomer(customer) {

    localStorage.setItem(
        "hungryzone-customer",
        JSON.stringify(customer)
    );

}


function openCustomerModal() {

    customerOverlay.classList.add("show");

    customerOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    customerError.textContent = "";

    document.body.classList.add("modal-open");

    updateCustomerTab();

}


function closeCustomer() {

    customerOverlay.classList.remove("show");

    customerOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove("modal-open");

}


closeCustomerModal.addEventListener("click", closeCustomer);


customerOverlay.addEventListener("click", function(event) {

    if (event.target === customerOverlay) {
        closeCustomer();
    }

});


/* =====================================================
   TABS CADASTRO / LOGIN
===================================================== */

document.querySelectorAll(".customer-tab").forEach(function(tab) {

    tab.addEventListener("click", function() {

        document.querySelectorAll(".customer-tab")
            .forEach(function(item) {

                item.classList.remove("active");

            });

        tab.classList.add("active");

        if (tab.dataset.tab === "register") {

            registerForm.classList.remove("hidden");
            loginForm.classList.add("hidden");

        } else {

            registerForm.classList.add("hidden");
            loginForm.classList.remove("hidden");

        }

        customerError.textContent = "";

    });

});


function updateCustomerTab() {

    const customer = getCustomer();

    if (customer) {

        document.querySelector(
            '[data-tab="login"]'
        ).click();

    } else {

        document.querySelector(
            '[data-tab="register"]'
        ).click();

    }

}


/* =====================================================
   MÁSCARAS
===================================================== */

function onlyNumbers(value) {

    return value.replace(/\D/g, "");

}


document.getElementById("customerCPF")
    .addEventListener("input", function() {

        let value = onlyNumbers(this.value);

        value = value.substring(0, 11);

        value = value.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        value = value.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        value = value.replace(
            /(\d{3})(\d{1,2})$/,
            "$1-$2"
        );

        this.value = value;

    });


document.getElementById("customerPhone")
    .addEventListener("input", function() {

        let value = onlyNumbers(this.value);

        value = value.substring(0, 11);

        if (value.length > 10) {

            value = value.replace(
                /^(\d{2})(\d{5})(\d{4}).*/,
                "($1) $2-$3"
            );

        } else {

            value = value.replace(
                /^(\d{2})(\d{4})(\d{0,4}).*/,
                "($1) $2-$3"
            );

        }

        this.value = value;

    });


document.getElementById("customerCEP")
    .addEventListener("input", function() {

        let value = onlyNumbers(this.value);

        value = value.substring(0, 8);

        value = value.replace(
            /^(\d{5})(\d)/,
            "$1-$2"
        );

        this.value = value;

    });


/* =====================================================
   CADASTRAR
===================================================== */

registerForm.addEventListener("submit", function(event) {

    event.preventDefault();

    customerError.textContent = "";


    const customer = {

        name:
            document.getElementById("customerName").value.trim(),

        cpf:
            document.getElementById("customerCPF").value.trim(),

        phone:
            document.getElementById("customerPhone").value.trim(),

        email:
            document.getElementById("customerEmail").value.trim(),

        password:
            document.getElementById("customerPassword").value,

        address: {

            cep:
                document.getElementById("customerCEP").value.trim(),

            street:
                document.getElementById("customerStreet").value.trim(),

            number:
                document.getElementById("customerNumber").value.trim(),

            complement:
                document.getElementById("customerComplement").value.trim(),

            neighborhood:
                document.getElementById("customerNeighborhood").value.trim()

        }

    };


    if (onlyNumbers(customer.cpf).length !== 11) {

        customerError.textContent =
            "Digite um CPF válido.";

        return;

    }


    if (onlyNumbers(customer.phone).length < 10) {

        customerError.textContent =
            "Digite um telefone válido.";

        return;

    }


    if (onlyNumbers(customer.address.cep).length !== 8) {

        customerError.textContent =
            "Digite um CEP válido.";

        return;

    }


    saveCustomer(customer);

    closeCustomer();

    openPaymentModal();

});


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    customerError.textContent = "";


    const customer = getCustomer();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    if (!customer) {

        customerError.textContent =
            "Nenhum cadastro foi encontrado neste navegador.";

        return;

    }


    if (
        email !== customer.email ||
        password !== customer.password
    ) {

        customerError.textContent =
            "E-mail ou senha incorretos.";

        return;

    }


    closeCustomer();

    openPaymentModal();

});


/* =====================================================
   PAGAMENTO
===================================================== */

const paymentOverlay =
    document.getElementById("paymentOverlay");

const closePaymentModal =
    document.getElementById("closePaymentModal");

const paymentTotal =
    document.getElementById("paymentTotal");


function getCartSubtotal() {

    return cart.reduce(function(total, item) {

        return total + item.price * item.quantity;

    }, 0);

}


function getCartTotal() {

    if (cart.length === 0) {
        return 0;
    }

    return getCartSubtotal() + 5;

}


function openPaymentModal() {

    if (cart.length === 0) {
        return;
    }


    paymentTotal.textContent =
        formatPrice(getCartTotal());


    generatePixCode();


    paymentOverlay.classList.add("show");

    paymentOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("modal-open");

}


function closePayment() {

    paymentOverlay.classList.remove("show");

    paymentOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove("modal-open");

}


closePaymentModal.addEventListener(
    "click",
    closePayment
);


paymentOverlay.addEventListener("click", function(event) {

    if (event.target === paymentOverlay) {
        closePayment();
    }

});


/* =====================================================
   BOTÃO FINALIZAR
===================================================== */

checkoutButton.addEventListener("click", function() {

    if (cart.length === 0) {

        checkoutButton.classList.add(
            "checkout-warning"
        );

        setTimeout(function() {

            checkoutButton.classList.remove(
                "checkout-warning"
            );

        }, 450);

        return;

    }


    const customer = getCustomer();


    if (!customer) {

        openCustomerModal();

        return;

    }


    openPaymentModal();

});


/* =====================================================
   FORMAS DE PAGAMENTO
===================================================== */

document.querySelectorAll(".payment-method")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            document.querySelectorAll(".payment-method")
                .forEach(function(item) {

                    item.classList.remove("active");

                });

            button.classList.add("active");

            document.querySelectorAll(".payment-content")
                .forEach(function(content) {

                    content.classList.remove("active");

                });


            const method = button.dataset.method;


            if (method === "pix") {

                document.getElementById("pixPayment")
                    .classList.add("active");

            }


            if (method === "card") {

                document.getElementById("cardPayment")
                    .classList.add("active");

            }


            if (method === "cash") {

                document.getElementById("cashPayment")
                    .classList.add("active");

            }

        });

    });


/* =====================================================
   PIX
===================================================== */

function generatePixCode() {

    const total =
        getCartTotal()
            .toFixed(2)
            .replace(".", "");


    const random =
        Math.random()
            .toString(36)
            .substring(2, 14)
            .toUpperCase();


    const code =
        "00020126580014BR.GOV.BCB.PIX0136" +
        random +
        "520400005303986540" +
        total +
        "5802BR5913HUNGRYZONE6009BARUERI62070503***6304";


    document.getElementById("pixCode").value = code;

}


document.getElementById("copyPixButton")
    .addEventListener("click", async function() {

        const input =
            document.getElementById("pixCode");

        try {

            await navigator.clipboard.writeText(
                input.value
            );

        } catch {

            input.select();

            document.execCommand("copy");

        }


        const message =
            document.getElementById("pixCopied");

        message.classList.add("show");

        setTimeout(function() {

            message.classList.remove("show");

        }, 1800);

    });


document.getElementById("pixConfirmButton")
    .addEventListener("click", function() {

        completePayment("PIX");

    });


/* =====================================================
   CARTÃO
===================================================== */

const cardNumber =
    document.getElementById("cardNumber");

const cardName =
    document.getElementById("cardName");

const cardExpiry =
    document.getElementById("cardExpiry");

const cardPreviewNumber =
    document.getElementById("cardPreviewNumber");

const cardPreviewName =
    document.getElementById("cardPreviewName");

const cardPreviewExpiry =
    document.getElementById("cardPreviewExpiry");


cardNumber.addEventListener("input", function() {

    let value = onlyNumbers(this.value);

    value = value.substring(0, 16);

    value = value.replace(
        /(\d{4})(?=\d)/g,
        "$1 "
    );

    this.value = value;

    const numbers = value || "";

    cardPreviewNumber.textContent =
        numbers || "•••• •••• •••• ••••";

});


cardName.addEventListener("input", function() {

    const value =
        this.value.toUpperCase();

    this.value = value;

    cardPreviewName.textContent =
        value || "SEU NOME";

});


cardExpiry.addEventListener("input", function() {

    let value = onlyNumbers(this.value);

    value = value.substring(0, 4);

    value = value.replace(
        /^(\d{2})(\d)/,
        "$1/$2"
    );

    this.value = value;

    cardPreviewExpiry.textContent =
        value || "MM/AA";

});


document.getElementById("cardCVV")
    .addEventListener("input", function() {

        this.value =
            onlyNumbers(this.value)
                .substring(0, 4);

    });


document.getElementById("cardType")
    .addEventListener("change", function() {

        const box =
            document.getElementById("installmentBox");

        if (this.value === "debito") {

            box.classList.add("hidden");

        } else {

            box.classList.remove("hidden");

        }

    });


document.getElementById("cardForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const number =
            onlyNumbers(cardNumber.value);

        const expiry =
            onlyNumbers(cardExpiry.value);

        const cvv =
            onlyNumbers(
                document.getElementById("cardCVV").value
            );


        if (number.length !== 16) {

            alert("Digite um número de cartão válido.");

            return;

        }


        if (expiry.length !== 4) {

            alert("Digite uma validade válida.");

            return;

        }


        if (cvv.length < 3) {

            alert("Digite um CVV válido.");

            return;

        }


        completePayment("Cartão");

    });


/* =====================================================
   DINHEIRO
===================================================== */

let needsChange = false;


document.querySelectorAll(".cash-option")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            document.querySelectorAll(".cash-option")
                .forEach(function(item) {

                    item.classList.remove("active");

                });

            button.classList.add("active");


            needsChange =
                button.dataset.change === "yes";


            const changeBox =
                document.getElementById("changeBox");


            if (needsChange) {

                changeBox.classList.remove("hidden");

            } else {

                changeBox.classList.add("hidden");

            }

        });

    });


document.getElementById("changeFor")
    .addEventListener("input", function() {

        const value =
            Number(this.value);

        const total =
            getCartTotal();

        const result =
            document.getElementById("changeResult");


        if (!value) {

            result.textContent =
                "Informe o valor para calcular o troco.";

            result.classList.remove("valid");

            return;

        }


        const change =
            value - total;


        if (change < 0) {

            result.textContent =
                "O valor informado é menor que o total do pedido.";

            result.classList.remove("valid");

            return;

        }


        result.textContent =
            "Troco: " + formatPrice(change);

        result.classList.add("valid");

    });


document.getElementById("cashConfirmButton")
    .addEventListener("click", function() {

        if (needsChange) {

            const value =
                Number(
                    document.getElementById("changeFor").value
                );


            if (!value || value < getCartTotal()) {

                alert(
                    "Informe um valor suficiente para o troco."
                );

                return;

            }

        }


        completePayment("Dinheiro");

    });


/* =====================================================
   PEDIDOS
===================================================== */

function getOrders() {

    return JSON.parse(
        localStorage.getItem("hungryzone-orders")
    ) || [];

}


function saveOrders(orders) {

    localStorage.setItem(
        "hungryzone-orders",
        JSON.stringify(orders)
    );

}


/* =====================================================
   CRIAR PEDIDO
===================================================== */

function createOrder(paymentMethod) {

    
    if (cart.length === 0) {
        return null;
    }


    const subtotal =
        getCartSubtotal();

    const delivery = 5;

    const total =
        subtotal + delivery;


    const now =
        new Date();


    const customer =
        getCustomer();


    const order = {

        id: Date.now(),

        number:
            "#" + String(Date.now()).slice(-5),

        date:
            now.toLocaleDateString("pt-BR"),

        time:
            now.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ),

        status: "preparing",

        paymentMethod:
            paymentMethod,

        customer: {

            name: customer.name,
            phone: customer.phone,
            email: customer.email

        },

        address:
            customer.address,

        items:
            cart.map(function(item) {

                return {

                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity

                };

            }),

        subtotal:
            subtotal,

        delivery:
            delivery,

        total:
            total

    };


    const orders =
        getOrders();


    orders.unshift(order);

    saveOrders(orders);


    return order;

}


/* =====================================================
   FINALIZAR PAGAMENTO
===================================================== */

function completePayment(paymentMethod) {

    if (cart.length === 0) {
        return;
    }


    const order =
        createOrder(paymentMethod);


    if (!order) {
        return;
    }


    cart = [];

    saveCart();

    updateCartCounter();

    renderCart();

    closePayment();

    showPreparingScreen(order);

}


/* =====================================================
   RENDERIZAR PEDIDOS
===================================================== */

function renderOrders() {

    const container =
        document.querySelector(".orders-container");


    if (!container) {
        return;
    }


    const orders =
        getOrders();


    const currentOrder =
        container.querySelector(".current-order");


    if (!currentOrder) {
        return;
    }


    if (orders.length === 0) {
        return;
    }


    const order =
        orders[0];


    let itemsHTML = "";


    order.items.forEach(function(item) {

        itemsHTML += `

            <div class="order-item">

                <div class="item-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                </div>

                <div class="item-info">

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        ${item.quantity}x •
                        ${item.quantity === 1
                            ? "1 unidade"
                            : item.quantity + " unidades"}
                    </span>

                </div>

                <strong>
                    ${formatPrice(
                        item.price * item.quantity
                    )}
                </strong>

            </div>

        `;

    });


    currentOrder.innerHTML = `

        <div class="order-top">

            <div>

                <span class="order-number">
                    PEDIDO ${order.number}
                </span>

                <h3>
                    Seu pedido está sendo preparado
                </h3>

            </div>

            <span class="status preparing">
                Preparando
            </span>

        </div>


        <div class="preparing-message">

            <div
                id="preparingEmoji"
                class="preparing-emoji"
            >
                👨‍🍳
            </div>

            <h3 id="preparingTitle">
                Preparando seu pedido!
            </h3>

            <p id="preparingText">
                A cozinha já recebeu seu pedido.
            </p>

            <div class="message-dots">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>


        <div class="order-progress">

            <div class="progress-step completed">

                <div class="progress-circle">
                    ✓
                </div>

                <span>
                    Pedido recebido
                </span>

            </div>

            <div class="progress-line completed-line"></div>

            <div class="progress-step active">

                <div class="progress-circle">
                    🍔
                </div>

                <span>
                    Preparando
                </span>

            </div>

            <div class="progress-line"></div>

            <div class="progress-step">

                <div class="progress-circle">
                    🚴
                </div>

                <span>
                    A caminho
                </span>

            </div>

            <div class="progress-line"></div>

            <div class="progress-step">

                <div class="progress-circle">
                    ✓
                </div>

                <span>
                    Entregue
                </span>

            </div>

        </div>


        <div class="order-items">

            ${itemsHTML}

        </div>


        <div class="order-payment">

            💳 Pagamento: <strong>${order.paymentMethod}</strong>

        </div>


        <div class="order-bottom">

            <div>

                <span class="order-date">
                    ${order.date} • ${order.time}
                </span>

                <strong class="total">
                    Total: ${formatPrice(order.total)}
                </strong>

            </div>

            <button
                class="details-button"
                type="button"
            >
                Acompanhar pedido
            </button>

        </div>

    `;


    startPreparingAnimation();

}


/* =====================================================
   ANIMAÇÃO DO PEDIDO
===================================================== */

let preparingInterval = null;


const preparingMessages = [

    {
        emoji: "👨‍🍳",
        title: "Preparando seu pedido!",
        text: "A cozinha já recebeu seu pedido e começou a preparar tudo."
    },

    {
        emoji: "🍔",
        title: "Seu lanche está ficando pronto!",
        text: "Estamos preparando tudo bem caprichado para você."
    },

    {
        emoji: "🍟",
        title: "Só mais um pouquinho...",
        text: "Estamos deixando tudo quentinho e crocante!"
    },

    {
        emoji: "🥤",
        title: "Quase pronto!",
        text: "Estamos finalizando seu pedido."
    },

    {
        emoji: "🛍️",
        title: "Pedido preparado!",
        text: "Tudo pronto! Seu pedido já pode seguir para você."
    }

];


function startPreparingAnimation() {

    clearInterval(preparingInterval);


    let index = 0;


    function changeMessage() {

        const emoji =
            document.getElementById("preparingEmoji");

        const title =
            document.getElementById("preparingTitle");

        const text =
            document.getElementById("preparingText");


        if (!emoji || !title || !text) {
            return;
        }


        const message =
            preparingMessages[index];


        emoji.classList.remove("message-change");
        title.classList.remove("message-change");
        text.classList.remove("message-change");


        void emoji.offsetWidth;


        emoji.classList.add("message-change");
        title.classList.add("message-change");
        text.classList.add("message-change");


        emoji.textContent = message.emoji;
        title.textContent = message.title;
        text.textContent = message.text;


        index =
            (index + 1) %
            preparingMessages.length;

    }


    changeMessage();

    preparingInterval =
        setInterval(changeMessage, 3000);

}


/* =====================================================
   TELA DE PROCESSAMENTO
===================================================== */

let checkoutInterval = null;


const checkoutMessages = [

    {
        emoji: "📦",
        title: "Recebemos seu pedido!",
        text: "Estamos enviando tudo para a cozinha."
    },

    {
        emoji: "👨‍🍳",
        title: "A cozinha já começou!",
        text: "Seu pedido está sendo preparado com carinho."
    },

    {
        emoji: "🍔",
        title: "Preparando seu lanche!",
        text: "Estamos deixando tudo fresquinho e caprichado."
    },

    {
        emoji: "🍟",
        title: "Tá quase pronto!",
        text: "Só falta finalizar alguns detalhes."
    }

];


function showPreparingScreen(order) {

    const overlay =
        document.getElementById("preparingOverlay");


    overlay.innerHTML = `

        <div class="preparing-modal">

            <div class="preparing-top">

                <span class="preparing-brand">
                    HUNGRYZONE
                </span>

                <span class="preparing-live">
                    ● AO VIVO
                </span>

            </div>

            <div class="preparing-spinner">

                <div class="spinner-ring"></div>

                <span>
                    👨‍🍳
                </span>

            </div>

            <div class="checkout-message">

                <div
                    id="checkoutEmoji"
                    class="checkout-emoji"
                >
                    📦
                </div>

                <h2 id="checkoutTitle">
                    Recebemos seu pedido!
                </h2>

                <p id="checkoutText">
                    Estamos enviando seu pedido para a cozinha.
                </p>

                <div class="checkout-dots">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>

            <div class="checkout-order-number">
                Pedido ${order.number}
            </div>

            <div class="checkout-progress">

                <div class="checkout-progress-bar"></div>

            </div>

            <small>
                Aguarde só um pouquinho...
            </small>

        </div>

    `;


    overlay.classList.add("show");

    document.body.classList.add(
        "preparing-open"
    );


    startCheckoutAnimation(order);

}


function startCheckoutAnimation(order) {

    clearInterval(checkoutInterval);


    let index = 0;


    const emoji =
        document.getElementById("checkoutEmoji");

    const title =
        document.getElementById("checkoutTitle");

    const text =
        document.getElementById("checkoutText");


    function update() {

        const message =
            checkoutMessages[index];


        emoji.classList.remove("checkout-change");
        title.classList.remove("checkout-change");
        text.classList.remove("checkout-change");


        void emoji.offsetWidth;


        emoji.classList.add("checkout-change");
        title.classList.add("checkout-change");
        text.classList.add("checkout-change");


        emoji.textContent = message.emoji;
        title.textContent = message.title;
        text.textContent = message.text;


        index =
            (index + 1) %
            checkoutMessages.length;

    }


    update();


    checkoutInterval =
        setInterval(update, 1800);


    setTimeout(function() {

        finishCheckout(order);

    }, 7200);

}


function finishCheckout(order) {

    clearInterval(checkoutInterval);

    const overlay =
        document.getElementById("preparingOverlay");


    overlay.classList.add("preparing-closing");


    setTimeout(function() {

        overlay.classList.remove("show");
        overlay.classList.remove("preparing-closing");

        overlay.innerHTML = "";

        document.body.classList.remove(
            "preparing-open"
        );


        showPage("orders");

        renderOrders();

    }, 350);

}


/* =====================================================
   BANCO COMPLETO DE PRODUTOS
===================================================== */

const productDatabase = {

    /* -------------------------
       HAMBÚRGUERES
    ------------------------- */

    "x-chicken": {
        id: "x-chicken",
        name: "x-chicken",
        price: 20.99,
        category: "hamburgueres",
        image: "https://images.unsplash.com/photo-1637710847214-f91d99669e18?auto=format&fit=crop&w=800&q=85"
    },

    "x-bacon": {
        id: "x-bacon",
        name: "X-Bacon",
        price: 22.99,
        category: "hamburgueres",
        image: "https://images.unsplash.com/photo-1648221410814-9d45c9ab144b?auto=format&fit=crop&w=800&q=85"
    },

    "x-salada": {
        id: "x-salada",
        name: "X-Salada",
        price: 19.99,
        category: "hamburgueres",
        image: "https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=800&q=85"
    },

    "duplo-cheddar": {
        id: "duplo-cheddar",
        name: "Duplo Cheddar",
        price: 24.99,
        category: "hamburgueres",
        image: "https://images.unsplash.com/photo-1771805689661-a6f03804a52e?auto=format&fit=crop&w=800&q=85"
    },


    /* -------------------------
       PIZZAS
    ------------------------- */

    "pizza-pepperoni": {
        id: "pizza-pepperoni",
        name: "Pizza de Pepperoni",
        price: 20.99,
        category: "pizzas",
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=85"
    },

    "pizza-calabresa": {
        id: "pizza-calabresa",
        name: "Pizza de Calabresa",
        price: 21.99,
        category: "pizzas",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=85"
    },

    "pizza-frango": {
        id: "pizza-frango",
        name: "Pizza de Frango com Catupiry",
        price: 23.99,
        category: "pizzas",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85"
    },

    "pizza-mm": {
        id: "pizza-mm",
        name: "Pizza de M&M",
        price: 20.99,
        category: "pizzas",
        image: "https://images.unsplash.com/photo-1534705867302-2a41394d2a3b?auto=format&fit=crop&w=800&q=85"
    },


    /* -------------------------
       PORÇÕES
    ------------------------- */

    "fritas-cheddar": {
        id: "fritas-cheddar",
        name: "Fritas C/ Cheddar",
        price: 16.99,
        category: "porcoes",
        image: "https://images.unsplash.com/photo-1700835880456-2e5519fa54d6?auto=format&fit=crop&w=800&q=85"
    },

    "fritas-bacon": {
        id: "fritas-bacon",
        name: "Fritas C/ Bacon",
        price: 18.99,
        category: "porcoes",
        image: "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?auto=format&fit=crop&w=800&q=85"
    },

    "onion-rings": {
        id: "onion-rings",
        name: "Onion Rings",
        price: 17.99,
        category: "porcoes",
        image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=85"
    },

    "nuggets": {
        id: "nuggets",
        name: "Nuggets",
        price: 18.99,
        category: "porcoes",
        image: "https://images.unsplash.com/photo-1627662168223-7df99068099a?auto=format&fit=crop&w=800&q=85"
    },


    /* -------------------------
       BEBIDAS NATURAIS
    ------------------------- */

    "suco-laranja": {
        id: "suco-laranja",
        name: "Suco de Laranja",
        price: 8.99,
        category: "naturais",
        image: "https://images.unsplash.com/photo-1583073600538-f219abfb20bc?auto=format&fit=crop&w=800&q=85"
    },

    "suco-morango": {
        id: "suco-morango",
        name: "Suco de Morango",
        price: 9.99,
        category: "naturais",
        image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=85"
    },

    "suco-maracuja": {
        id: "suco-maracuja",
        name: "Suco de Maracujá",
        price: 8.99,
        category: "naturais",
        image: "https://images.unsplash.com/photo-1606673993554-a5f993a16e0d?auto=format&fit=crop&w=800&q=85"
    },

    "limonada": {
        id: "limonada",
        name: "Limonada",
        price: 7.99,
        category: "naturais",
        image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=800&q=85"
    },


    /* -------------------------
       REFRIGERANTES
    ------------------------- */

    "coca-cola": {
        id: "coca-cola",
        name: "Coca-Cola",
        price: 6.99,
        category: "refrigerantes",
        image: "https://images.unsplash.com/photo-1527960392543-80cd0fa46382?auto=format&fit=crop&w=800&q=85"
    },

    "pepsi": {
        id: "pepsi",
        name: "Pepsi",
        price: 6.49,
        category: "refrigerantes",
        image: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=800&q=85"
    },

    "guarana": {
        id: "guarana",
        name: "Guaraná",
        price: 6.49,
        category: "refrigerantes",
        image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=800&q=85"
    },

    "fanta-laranja": {
        id: "fanta-laranja",
        name: "Fanta Laranja",
        price: 6.49,
        category: "refrigerantes",
        image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=800&q=85"
    },


    /* -------------------------
       SOBREMESAS
    ------------------------- */

    "brownie": {
        id: "brownie",
        name: "Brownie",
        price: 10.99,
        category: "sobremesas",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=85"
    },

    "pudim": {
        id: "pudim",
        name: "Pudim",
        price: 9.99,
        category: "sobremesas",
        image: "https://images.unsplash.com/photo-1780798465831-de1e4d58ee46?auto=format&fit=crop&w=800&q=85"
    },

    "mousse-chocolate": {
        id: "mousse-chocolate",
        name: "Mousse de Chocolate",
        price: 11.99,
        category: "sobremesas",
        image: "https://images.unsplash.com/photo-1673551494277-92204546b504?auto=format&fit=crop&w=800&q=85"
    },

    "acai": {
        id: "acai",
        name: "Açaí",
        price: 14.99,
        category: "sobremesas",
        image: "https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?auto=format&fit=crop&w=800&q=85"
    }

};


/* =====================================================
   MAIS PEDIDOS
   8 PRODUTOS
===================================================== */

const featuredProducts = [

    productDatabase["fritas-cheddar"],
    productDatabase["x-chicken"],
    productDatabase["pizza-pepperoni"],
    productDatabase["pizza-mm"],
    productDatabase["x-bacon"],
    productDatabase["pizza-calabresa"],
    productDatabase["fritas-bacon"],
    productDatabase["brownie"]

];


/* =====================================================
   NOMES DAS CATEGORIAS
===================================================== */

const categoryNames = {

    "mais-pedidos": "MAIS PEDIDOS",

    "hamburgueres": "HAMBÚRGUERES",

    "pizzas": "PIZZAS",

    "porcoes": "PORÇÕES",

    "naturais": "BEBIDAS NATURAIS",

    "refrigerantes": "REFRIGERANTES",

    "sobremesas": "SOBREMESAS"

};


/* =====================================================
   PERSONALIZAÇÃO DE INGREDIENTES
===================================================== */
const ingredientModal = document.getElementById("ingredientModal");
let selectedProductForIngredients = null;
const paidExtrasCatalog = {
  hamburgueres: [{name:"Bacon extra",price:3.50},{name:"Queijo cheddar",price:2.50},{name:"Hambúrguer extra",price:5.00},{name:"Ovo",price:2.00}],
  pizzas: [{name:"Borda recheada",price:7.00},{name:"Queijo extra",price:4.00},{name:"Bacon extra",price:4.00}],
  porcoes: [{name:"Cheddar extra",price:3.00},{name:"Bacon extra",price:3.50},{name:"Molho especial",price:2.00}],
  default: [{name:"Molho extra",price:2.00}]
};
// Categorias que não oferecem adicionais pagos.
const categoriesWithoutExtras = ["naturais", "refrigerantes", "sobremesas"];
const ingredientCatalog = {
  "x-chicken": ["Pão", "Frango", "Queijo", "Alface", "Tomate", "Maionese"],
  "x-bacon": ["Pão", "Hambúrguer", "Bacon", "Queijo", "Alface", "Tomate", "Maionese"],
  "x-salada": ["Pão", "Hambúrguer", "Queijo", "Alface", "Tomate", "Milho", "Maionese"],
  "duplo-cheddar": ["Pão", "2 hambúrgueres", "Cheddar", "Cebola", "Molho especial"],
  "pizza-pepperoni": ["Massa", "Molho de tomate", "Queijo", "Pepperoni", "Orégano"],
  "pizza-calabresa": ["Massa", "Molho de tomate", "Queijo", "Calabresa", "Cebola", "Orégano"],
  "pizza-frango": ["Massa", "Molho de tomate", "Frango", "Catupiry", "Queijo", "Orégano"],
  "pizza-mm": ["Massa doce", "Chocolate", "M&M's"]
};
const defaultIngredients = {
  "fritas-cheddar": ["Batata", "Cheddar"],
  "combo-chicken": ["Hambúrguer de frango", "Batata frita", "Refrigerante"],
  "pizza-pepperoni": ingredientCatalog["pizza-pepperoni"]
};
function ingredientsFor(product) {
  if (ingredientCatalog[product.id]) return ingredientCatalog[product.id];
  if (defaultIngredients[product.id]) return defaultIngredients[product.id];
  if (product.category === "porcoes") return ["Batata", "Cheddar", "Bacon", "Molho da casa"];
  if (product.category === "naturais") return ["Fruta", "Água", "Açúcar"];
  if (product.category === "sobremesas") return ["Massa", "Chocolate", "Cobertura"];
  if (product.category === "pizzas") return ["Massa", "Molho", "Queijo", "Recheio", "Orégano"];
  if (product.category === "hamburgueres") return ["Pão", "Hambúrguer", "Queijo", "Alface", "Tomate", "Molho da casa"];
  return [];
}
function openIngredientModal(product) {
  if (!ingredientModal) { addToCart(product); return; }
  selectedProductForIngredients = product;
  document.getElementById("ingredientProductImage").src = product.image || "";
  document.getElementById("ingredientProductImage").alt = product.name;
  document.getElementById("ingredientProductName").textContent = product.name;
  document.getElementById("ingredientProductPrice").textContent = formatPrice(product.price);
  document.getElementById("ingredientModalPrice").textContent = formatPrice(product.price);
  const options = document.getElementById("ingredientOptions");
  options.innerHTML = "";
  const extrasContainer = document.getElementById("paidExtrasOptions");
  if (extrasContainer) {
    extrasContainer.innerHTML = "";
    const hideExtras = categoriesWithoutExtras.includes(product.category);
    const extrasHeading = document.querySelector(".paid-extras-heading");
    if (extrasHeading) extrasHeading.style.display = hideExtras ? "none" : "";
    extrasContainer.style.display = hideExtras ? "none" : "";
    const extras = hideExtras ? [] : (paidExtrasCatalog[product.category] || paidExtrasCatalog.default);
    extras.forEach(function(extra, index) {
      const label = document.createElement("label");
      label.className = "ingredient-option paid-extra-option";
      label.innerHTML = `<span class="ingredient-check-wrap"><input type="checkbox" class="paid-extra-checkbox" data-extra-name="${extra.name}" data-extra-price="${extra.price}" id="paid-extra-${index}"><span class="ingredient-custom-check">✓</span></span><span class="ingredient-label-text"><strong>${extra.name}</strong><small>Adicionar por +${formatPrice(extra.price)}</small></span>`;
      extrasContainer.appendChild(label);
    });
  }
  const ingredients = ingredientsFor(product);
  if (!ingredients.length) {
    options.innerHTML = '<p class="no-ingredients">Este produto não tem ingredientes para retirar. Você pode adicioná-lo ao carrinho.</p>';
  } else {
    ingredients.forEach(function(ingredient, index) {
      const label = document.createElement("label");
      label.className = "ingredient-option";
      label.innerHTML = `<span class="ingredient-check-wrap"><input type="checkbox" checked value="${ingredient.replace(/"/g, '&quot;')}" id="ingredient-${index}"><span class="ingredient-custom-check">✓</span></span><span class="ingredient-label-text"><strong>${ingredient}</strong><small>Incluir no produto</small></span>`;
      options.appendChild(label);
    });
  }
  updateIngredientModalPrice();
  ingredientModal.classList.add("is-open");
  ingredientModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("ingredient-modal-open");
}
function closeIngredientModal() {
  if (!ingredientModal) return;
  ingredientModal.classList.remove("is-open");
  ingredientModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("ingredient-modal-open");
  selectedProductForIngredients = null;
}
document.getElementById("closeIngredientModal")?.addEventListener("click", closeIngredientModal);
document.querySelectorAll("[data-close-ingredients]").forEach(el => el.addEventListener("click", closeIngredientModal));
function updateIngredientModalPrice() {
  if (!selectedProductForIngredients) return;
  const extrasTotal = Array.from(document.querySelectorAll(".paid-extra-checkbox:checked"))
    .reduce((sum, input) => sum + Number(input.dataset.extraPrice || 0), 0);
  const total = Number(selectedProductForIngredients.price) + extrasTotal;
  const priceEl = document.getElementById("ingredientModalPrice");
  if (priceEl) priceEl.textContent = formatPrice(total);
}
document.getElementById("ingredientOptions")?.addEventListener("change", updateIngredientModalPrice);
document.getElementById("paidExtrasOptions")?.addEventListener("change", updateIngredientModalPrice);
document.getElementById("confirmIngredients")?.addEventListener("click", function() {
  if (!selectedProductForIngredients) return;
  const removed = Array.from(document.querySelectorAll("#ingredientOptions input[type=checkbox]:not(:checked)")).map(input => input.value);
  const extras = Array.from(document.querySelectorAll(".paid-extra-checkbox:checked")).map(input => ({name: input.dataset.extraName, price: Number(input.dataset.extraPrice)}));
  const product = selectedProductForIngredients;
  closeIngredientModal();
  addToCart(product, { removedIngredients: removed, extras: extras });
});
document.addEventListener("keydown", function(event) { if (event.key === "Escape") closeIngredientModal(); });

/* =====================================================
   RENDERIZAR PRODUTOS
===================================================== */

function renderProducts(category = "mais-pedidos") {

    const productsGrid = document.getElementById("productsGrid");
    const productsTitle = document.getElementById("productsTitle");
    const productsCount = document.getElementById("productsCount");
    const searchInput = document.getElementById("productSearchInput");

    if (!productsGrid) return;

    const searchQuery = normalizeProductSearch(searchInput ? searchInput.value : "");
    let products = [];

    // Ao pesquisar, procura em TODO o catálogo, independentemente da categoria selecionada.
    if (searchQuery) {
        products = Object.values(productDatabase).filter(function(product) {
            const searchableText = normalizeProductSearch(
                `${product.name || ""} ${product.category || ""} ${categoryNames[product.category] || ""}`
            );
            return searchableText.includes(searchQuery);
        });
    } else if (category === "mais-pedidos") {
        products = featuredProducts;
    } else {
        products = Object.values(productDatabase).filter(function(product) {
            return product.category === category;
        });
    }

    if (productsTitle) {
        productsTitle.textContent = searchQuery
            ? "RESULTADOS DA BUSCA"
            : (categoryNames[category] || "PRODUTOS");
    }

    if (productsCount) {
        productsCount.textContent = searchQuery
            ? `${products.length} ${products.length === 1 ? "resultado" : "resultados"}`
            : `${products.length} produtos`;
    }

    productsGrid.innerHTML = "";

    if (products.length === 0) {
        const empty = document.createElement("div");
        empty.className = "search-empty-state";
        empty.innerHTML = `
            <span class="search-empty-icon" aria-hidden="true">⌕</span>
            <strong>Nenhum produto encontrado</strong>
            <p>Tente buscar por outro nome, como Coca-Cola, pizza ou hambúrguer.</p>
        `;
        productsGrid.appendChild(empty);
        return;
    }

    products.forEach(function(product) {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-bottom">
                    <strong>${formatPrice(product.price)}</strong>
                    <button
                        class="add-button"
                        type="button"
                        aria-label="Adicionar ${product.name}"
                        title="Adicionar ${product.name} ao carrinho"
                    >+</button>
                </div>
            </div>
        `;

        const productImg = card.querySelector(".product-image img");
        productImg.addEventListener("error", function() {
            // 1) tenta a foto de reserva (URL externa); 2) se falhar, esconde sem quebrar o layout.
            this.style.visibility = "hidden";
            this.parentElement.classList.add("image-unavailable");
            this.alt = "Imagem indisponível: " + product.name;
        }, { once: true });

        const addButton = card.querySelector(".add-button");
        addButton.addEventListener("click", function() {
            openIngredientModal(product);
        });

        productsGrid.appendChild(card);
    });
}

// Normaliza acentos e maiúsculas para a pesquisa funcionar com ou sem acentos.
function normalizeProductSearch(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .trim();
}

// Pesquisa em tempo real. O renderProducts consulta o catálogo inteiro quando há texto.
(function setupProductSearch() {
    const searchInput = document.getElementById("productSearchInput");
    const clearButton = document.getElementById("clearProductSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", function() {
        const activeCategory = document.querySelector(".category-button.active");
        renderProducts(activeCategory ? activeCategory.dataset.category : "mais-pedidos");
        if (clearButton) {
            clearButton.classList.toggle("visible", searchInput.value.length > 0);
        }
    });

    if (clearButton) {
        clearButton.addEventListener("click", function() {
            searchInput.value = "";
            clearButton.classList.remove("visible");
            const activeCategory = document.querySelector(".category-button.active");
            renderProducts(activeCategory ? activeCategory.dataset.category : "mais-pedidos");
            searchInput.focus();
        });
    }
})();

/* =====================================================
   CATEGORIAS
===================================================== */

document.querySelectorAll(".category-button")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            document.querySelectorAll(".category-button")
                .forEach(function(item) {

                    item.classList.remove("active");

                });


            button.classList.add("active");


            const category =
                button.dataset.category;


            renderProducts(category);

        });

    });


/* =====================================================
   PEDIR NOVAMENTE
===================================================== */

document.querySelectorAll(".repeat-button")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            const product =
                productDatabase[
                    button.dataset.product
                ];


            if (!product) {
                return;
            }


            addToCart(product);

        });

    });


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

updateCartCounter();

renderCart();

renderProducts("mais-pedidos");

renderOrders();
/* =====================================================
   CARROSSEL DE PROMOÇÕES DO DIA
===================================================== */
(function initPromoCarousel() {
    const banner = document.querySelector('.banner');
    if (!banner) return;
    const track = banner.querySelector('.banner-track');
    const slides = Array.from(banner.querySelectorAll('.promo-slide'));
    const dots = Array.from(banner.querySelectorAll('.promo-dot'));
    const prev = banner.querySelector('.promo-prev');
    const next = banner.querySelector('.promo-next');
    const progressBar = banner.querySelector('#promoProgressBar');
    if (!track || !slides.length) return;

    let current = 0;
    let timer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === current);
            slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
            slide.querySelectorAll('a,button').forEach(el => el.tabIndex = i === current ? 0 : -1);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
            dot.setAttribute('aria-current', i === current ? 'true' : 'false');
        });
        if (progressBar) {
            progressBar.classList.remove('running');
            void progressBar.offsetWidth;
            if (!reduceMotion) progressBar.classList.add('running');
        }
    }
    function stop() { if (timer) window.clearInterval(timer); timer = null; }
    function start() {
        stop();
        // Rotação automática a cada 5 segundos, inclusive com o mouse sobre o banner.
        if (!reduceMotion && slides.length > 1) timer = window.setInterval(() => showSlide(current + 1), 5000);
    }
    prev?.addEventListener('click', () => { showSlide(current - 1); start(); });
    next?.addEventListener('click', () => { showSlide(current + 1); start(); });
    dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.slide)); start(); }));

    // Fotos reais externas: precisam de conexão com a internet.
    const imageFallbacks = [
        ['https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=85'],
        ['https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85'],
        ['https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=85', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=85']
    ];
    banner.querySelectorAll('.banner-image img').forEach((img, i) => {
        let attempt = 0;
        const candidates = imageFallbacks[i] || [];
        img.addEventListener('load', () => img.classList.add('image-loaded'));
        img.addEventListener('error', () => {
            img.classList.remove('image-loaded');
            attempt++;
            if (attempt < candidates.length) img.src = candidates[attempt];
            else { img.style.opacity = '0'; img.closest('.banner-image')?.classList.add('image-unavailable'); }
        });
        if (candidates.length) img.src = candidates[0];
    });

    banner.querySelectorAll('[data-promo-action]').forEach(button => {
        button.addEventListener('click', () => {
            const targetCategory = button.dataset.promoAction;
            const home = document.getElementById('homePage');
            if (home && !home.classList.contains('active-page')) document.getElementById('homeLink')?.click();
            if (targetCategory !== 'products') document.querySelector(`.category-button[data-category="${targetCategory}"]`)?.click();
            document.querySelector('.categories')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
    });
    showSlide(0);
    start();
})();
