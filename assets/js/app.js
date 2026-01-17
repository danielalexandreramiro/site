let dados = null;

fetch('data/destinos.json')
  .then(res => res.json())
  .then(json => {
    dados = json;
    iniciar();
  });

function iniciar() {
  if (document.getElementById('cidadeSelect')) carregarCidades();
  if (document.getElementById('tiposContainer')) carregarTipos();
  if (document.getElementById('listaDestinos')) carregarDestinos();
  if (document.getElementById('conteudoDetalhes')) carregarDetalhes();
}

/* HOME */
function carregarCidades() {
  const select = document.getElementById('cidadeSelect');

  dados.cidades.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome;
    select.appendChild(opt);
  });

  document.getElementById('btnCidade').onclick = () => {
    if (select.value)
      window.location.href = `cidade.html?cidade=${select.value}`;
  };
}

/* CIDADE */
function carregarTipos() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  document.getElementById('tituloCidade').textContent =
    `O que fazer em ${cidade.nome}?`;

  const container = document.getElementById('tiposContainer');

  Object.keys(cidade.tipos).forEach(tipo => {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = `destinos.html?cidade=${cidadeId}&tipo=${tipo}`;
    card.textContent = tipo.toUpperCase();
    container.appendChild(card);
  });
}

/* DESTINOS - SEM MAPA */
function carregarDestinos() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');
  const tipo = params.get('tipo');

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  const lista = cidade.tipos[tipo];

  document.getElementById('tituloDestino').textContent =
    `${tipo.toUpperCase()} em ${cidade.nome}`;

  const container = document.getElementById('listaDestinos');

  lista.forEach((l) => {
    const card = document.createElement('div');
    card.className = 'card-destino';
    card.style.cursor = 'pointer';
    
    card.innerHTML = `
      <img src="${l.foto}">
      <div class="conteudo">
        <h2>${l.nome}</h2>
        <p>${l.descricao}</p>
      </div>`;
    
    container.appendChild(card);
    
    // Clique no card abre detalhes
    card.onclick = () => {
      const nomeEncoded = encodeURIComponent(l.nome);
      window.location.href = `detalhes.html?cidade=${cidadeId}&tipo=${tipo}&destino=${nomeEncoded}`;
    };
  });
}

/* DETALHES - COM MAPA */
function carregarDetalhes() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');
  const tipo = params.get('tipo');
  const nomeDestino = decodeURIComponent(params.get('destino'));

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  const lista = cidade.tipos[tipo];
  const destino = lista.find(d => d.nome === nomeDestino);

  const container = document.getElementById('conteudoDetalhes');
  container.className = 'detalhes-container';
  container.innerHTML = `
    <div class="detalhes-header">
      <img src="${destino.foto}">
    </div>
    <div class="detalhes-info">
      <h1>${destino.nome}</h1>
      <p>${destino.descricao}</p>
    </div>
    <div id="mapaDetalhes"></div>
  `;

  // Inicializar mapa
  setTimeout(() => {
    const mapa = L.map('mapaDetalhes');
    mapa.setView([destino.lat, destino.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(mapa);
    L.marker([destino.lat, destino.lng])
      .addTo(mapa)
      .bindPopup(destino.nome);
  }, 100);
}

// Topbar com botão Home
const topbar = document.getElementById('topbar');

if (topbar) {
  topbar.innerHTML = `
    <a href="index.html" class="home-icon">🏠</a>
  `;
}


// ...existing code...

/* DETALHES - COM MAPA E FOTOS */
function carregarDetalhes() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');
  const tipo = params.get('tipo');
  const nomeDestino = decodeURIComponent(params.get('destino'));

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  const lista = cidade.tipos[tipo];
  const destino = lista.find(d => d.nome === nomeDestino);

  const container = document.getElementById('conteudoDetalhes');
  container.className = 'detalhes-container';
  
  let fotosHTML = '';
  
  if (destino.fotos && destino.fotos.length > 0) {
    fotosHTML = `
      <div class="galeria-fotos">
        ${destino.fotos.map(foto => `
          <div class="card-foto">
            <img src="${foto.src}" alt="${foto.descricao}">
            <div class="info-foto">
              <p class="descricao-foto">${foto.descricao}</p>
              <div class="detalhes-foto">
                <span class="preco">R$ ${foto.preco}</span>
                <span class="dificuldade">${foto.dificuldade}</span>
                <span class="avaliacao">${gerarEstrelas(foto.avaliacao)}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="detalhes-header">
      <img src="${destino.foto}" alt="${destino.nome}">
    </div>
    <div class="detalhes-info">
      <h1>${destino.nome}</h1>
      <p>${destino.descricao}</p>
    </div>
    ${fotosHTML}
    <div id="mapaDetalhes"></div>
  `;

  // Inicializar mapa
  setTimeout(() => {
    const mapa = L.map('mapaDetalhes');
    mapa.setView([destino.lat, destino.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(mapa);
    L.marker([destino.lat, destino.lng])
      .addTo(mapa)
      .bindPopup(destino.nome);
  }, 100);
}

/* FUNÇÃO PARA GERAR ESTRELAS */
function gerarEstrelas(avaliacao) {
  const estrelaCheia = '⭐';
  const meia = avaliacao % 1 !== 0 ? '⭐' : '';
  const total = Math.floor(avaliacao);
  return estrelaCheia.repeat(total) + meia;
}

// ...existing code...

// ...existing code...

// HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Fechar menu ao clicar em um link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// ...existing code...