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

/* DESTINOS */
function carregarDestinos() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');
  const tipo = params.get('tipo');

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  const lista = cidade.tipos[tipo];

  document.getElementById('tituloDestino').textContent =
    `${tipo.toUpperCase()} em ${cidade.nome}`;

  const mapa = L.map('mapa');
  mapa.setView([lista[0].lat, lista[0].lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(mapa);

  const container = document.getElementById('listaDestinos');

  lista.forEach(l => {
    const card = document.createElement('div');
    card.className = 'card-destino';
    card.innerHTML = `
      <img src="${l.foto}">
      <div class="conteudo">
        <h2>${l.nome}</h2>
        <p>${l.descricao}</p>
      </div>`;
    container.appendChild(card);

    L.marker([l.lat, l.lng])
      .addTo(mapa)
      .bindPopup(l.nome);
  });
}
// Topbar com botão Home
const topbar = document.getElementById('topbar');

if (topbar) {
  topbar.innerHTML = `
    <a href="index.html" class="home-icon">🏠</a>
  `;
}
