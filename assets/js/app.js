let dados = null;

fetch('data/destinos.json')
  .then(res => res.json())
  .then(json => {
    dados = json;
    iniciar();
  })
  .catch(err => console.error('Erro ao carregar JSON:', err));

function iniciar() {
  if (document.getElementById('cidadeSelect')) carregarCidades();
  if (document.getElementById('tiposContainer')) carregarTipos();
  if (document.getElementById('listaDestinos')) carregarDestinos();
  if (document.getElementById('conteudoDetalhes')) carregarDetalhes();
  if (document.getElementById('mapaCidade')) carregarMapaCidade();
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

  select.addEventListener('change', (e) => {
    if (e.target.value) {
      window.location.href = `cidade.html?cidade=${e.target.value}`;
    }
  });
}

/* CIDADE - COM MAPA */
function carregarTipos() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  if (!cidade) {
    console.error('Cidade não encontrada:', cidadeId);
    return;
  }

  document.getElementById('tituloCidade').textContent =
    `O que fazer em ${cidade.nome}?`;

  const container = document.getElementById('tiposContainer');

  Object.keys(cidade.tipos).forEach(tipo => {
    const card = document.createElement('a');
    card.className = `card ${tipo.toLowerCase()}`;
    card.href = `destinos.html?cidade=${cidadeId}&tipo=${tipo}`;
    card.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    container.appendChild(card);
  });
}

/* MAPA DA CIDADE */
function carregarMapaCidade() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  if (!cidade) {
    console.error('Cidade não encontrada');
    return;
  }

  // Cores por tipo
  const cores = {
    praia: '#0066ff',
    passeio: '#ff8c00',
    restaurante: '#d41159',
    Apoio: '#28a745',
    apoio: '#28a745'
  };

  // Criar ícone customizado
  function criarIcone(tipo) {
    const cor = cores[tipo] || '#999';
    return L.divIcon({
      html: `<div style="background: ${cor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px #333; font-size: 16px; color: #fff;">📍</div>`,
      iconSize: [30, 30],
      className: 'custom-icon'
    });
  }

  // Inicializar mapa
  const mapa = L.map('mapaCidade');
  
  // Coordenadas padrão (será ajustada ao adicionar marcadores)
  mapa.setView([-7.31, -34.8], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapa);

  // Adicionar marcadores
  const marcadores = [];
  
  Object.keys(cidade.tipos).forEach(tipo => {
    cidade.tipos[tipo].forEach(destino => {
      const marker = L.marker([destino.lat, destino.lng], {
        icon: criarIcone(tipo)
      })
        .bindPopup(`
          <div style="text-align: center;">
            <strong>${destino.nome}</strong><br>
            <small>${tipo}</small>
          </div>
        `)
        .addTo(mapa);
      
      marcadores.push([destino.lat, destino.lng]);
    });
  });

  // Ajustar zoom para mostrar todos os marcadores
  if (marcadores.length > 0) {
    const group = new L.featureGroup(
      marcadores.map(coords => L.marker(coords))
    );
    mapa.fitBounds(group.getBounds().pad(0.1));
  }
}

/* DESTINOS - SEM MAPA */
function carregarDestinos() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');
  const tipo = params.get('tipo');

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  if (!cidade) {
    console.error('Cidade não encontrada:', cidadeId);
    return;
  }

  const lista = cidade.tipos[tipo];
  if (!lista) {
    console.error('Tipo não encontrado:', tipo);
    return;
  }

  document.getElementById('tituloDestino').textContent =
    `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} em ${cidade.nome}`;

  const container = document.getElementById('listaDestinos');

  lista.forEach((l) => {
    const card = document.createElement('div');
    card.className = 'card-destino';
    card.style.cursor = 'pointer';
    
    card.innerHTML = `
      <img src="${l.foto}" alt="${l.nome}">
      <div class="conteudo">
        <h2>${l.nome}</h2>
        <p>${l.descricao}</p>
      </div>`;
    
    container.appendChild(card);
    
    card.onclick = () => {
      const nomeEncoded = encodeURIComponent(l.nome);
      window.location.href = `detalhes.html?cidade=${cidadeId}&tipo=${tipo}&destino=${nomeEncoded}`;
    };
  });
}

/* DETALHES - COM MAPA E FOTOS */
function carregarDetalhes() {
  const params = new URLSearchParams(window.location.search);
  const cidadeId = params.get('cidade');
  const tipo = params.get('tipo');
  const nomeDestino = decodeURIComponent(params.get('destino'));

  console.log('Carregando detalhes:', { cidadeId, tipo, nomeDestino });

  const cidade = dados.cidades.find(c => c.id === cidadeId);
  if (!cidade) {
    console.error('Cidade não encontrada:', cidadeId);
    return;
  }

  const lista = cidade.tipos[tipo];
  if (!lista) {
    console.error('Tipo não encontrado:', tipo);
    return;
  }

  const destino = lista.find(d => d.nome === nomeDestino);
  if (!destino) {
    console.error('Destino não encontrado:', nomeDestino);
    console.log('Destinos disponíveis:', lista.map(d => d.nome));
    return;
  }

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
                ${foto.preco && foto.preco !== '0' ? `<span class="preco">R$ ${foto.preco}</span>` : ''}
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
  const total = Math.floor(avaliacao);
  return '⭐'.repeat(total);
}

// HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}