document.addEventListener("DOMContentLoaded", function () {
    loadProdutos();
    verificarClienteLogado();
});


function verificarClienteLogado() {
    const clienteId = localStorage.getItem("userId");

    if (!clienteId) {
        alert("Você precisa fazer login antes de comprar.");
        window.location.href = "login.html";
        return;
    }

    
    fetch(`http://localhost:8080/clientes/${clienteId}`, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao buscar cliente: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(cliente => {
        localStorage.setItem("clienteNome", cliente.nomeCompleto);
        localStorage.setItem("clienteEmail", cliente.email);
    })
    .catch(error => {
        console.error("Erro ao buscar cliente:", error);
        alert("Erro ao obter dados do cliente. Faça login novamente.");
        window.location.href = "login.html";
    });
}


async function loadProdutos() {
    try {
        const response = await fetch("http://localhost:8080/produtos");

        
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error(`Erro ao carregar produtos: ${response.status} ${response.statusText}`);
        }

        const produtos = await response.json();

        const listaProdutos = document.getElementById("lista-produtos");
        if (!listaProdutos) {
            console.error("Erro: Elemento #lista-produtos não encontrado!");
            return;
        }

        listaProdutos.innerHTML = produtos.map((produto, index) => `
            <div class="album">
                <h2>${produto.nome}</h2>
                <p>Artista: ${produto.artista}</p>
                <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
                <button class="btn-comprar" 
                        data-produto='${JSON.stringify(produto)}'>Comprar Agora</button>
            </div>
        `).join("");

        
        document.querySelectorAll(".btn-comprar").forEach(button => {
            button.addEventListener("click", function () {
                const produtoEscolhido = JSON.parse(this.getAttribute("data-produto"));
                irParaPagamento(produtoEscolhido);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Erro ao carregar produtos! Verifique sua conexão com a API.");
    }
}

function irParaPagamento(produtoEscolhido) {
    try {
        const clienteId = localStorage.getItem("userId");
        const clienteNome = localStorage.getItem("clienteNome");
        const clienteEmail = localStorage.getItem("clienteEmail");

        if (!clienteId || !clienteNome || !clienteEmail) {
            alert("Erro ao recuperar os dados do cliente. Faça login novamente.");
            window.location.href = "login.html";
            return;
        }

        
        const urlParams = new URLSearchParams({
            clienteId,
            clienteNome,
            clienteEmail,
            produto: produtoEscolhido.nome,
            preco: produtoEscolhido.preco
        });

        window.location.href = `formasdepagamento.html?${urlParams.toString()}`;
    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        alert("Erro ao processar o pagamento.");
    }
}
