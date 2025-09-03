// Nossos dados (simulando um banco de dados)
const videoData = {
    "Filmes Ação": [
        { id: "aC88bb_eFPU", title: "Filme de Ação Incrível", category: "Ação", thumbnail: "https://img.youtube.com/vi/aC88bb_eFPU/hqdefault.jpg" },
        { id: "ot8Xk1rLqE0", title: "O Grande Roubo", category: "Ação", thumbnail: "https://img.youtube.com/vi/ot8Xk1rLqE0/hqdefault.jpg" }
    ],
    "Filmes Comédia": [
        { id: "dQw4w9WgXcQ", title: "Comédia Hilária", category: "Comédia", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
        { id: "jNQXAC9IVRw", title: "Situações Engraçadas", category: "Comédia", thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg" }
    ],
    "Séries Drama": [
        { id: "M7lc1UVf-VE", title: "Drama Intenso - Episódio 1", category: "Drama", thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg" },
        { id: "k-f5Q44L-44", title: "Drama Intenso - Episódio 2", category: "Drama", thumbnail: "https://img.youtube.com/vi/k-f5Q44L-44/hqdefault.jpg" }
    ]
};

// Variáveis globais para o player
let player;
let currentPlaylist = [];
let currentVideoIndex = 0;

// Seletores de elementos do DOM
const navTabs = document.getElementById('nav-tabs');
const videoGridContainer = document.getElementById('video-grid-container');
const overlayEndScreen = document.getElementById('overlay-end-screen');
const replayButton = document.getElementById('replay-button');
const nextButton = document.getElementById('next-button');

// --- Funções da API do YouTube Player ---
function onYouTubeIframeAPIReady() {
    // Esta função é chamada quando a API do YouTube está pronta
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: '', // Será preenchido quando um vídeo for selecionado
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0, // Tenta desativar sugestões (agora mostra do mesmo canal)
            'modestbranding': 1, // Minimiza o logo do YouTube
            'showinfo': 0, // Desativa informações do vídeo (título/uploader)
            'iv_load_policy': 3 // Desativa anotações no vídeo
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // O player está pronto
    console.log('Player do YouTube está pronto!');
    // Não começamos a tocar aqui, esperamos o usuário selecionar um vídeo
}

function onPlayerStateChange(event) {
    // Eventos de mudança de estado do player
    if (event.data == YT.PlayerState.ENDED) {
        // Vídeo terminou
        overlayEndScreen.classList.remove('hidden');
    } else if (event.data == YT.PlayerState.PLAYING) {
        // Vídeo está tocando, esconde a tela final
        overlayEndScreen.classList.add('hidden');
    }
}

// --- Funções de Renderização e Lógica ---

// Renderiza as abas de navegação
function renderTabs() {
    navTabs.innerHTML = '';
    Object.keys(videoData).forEach((tabName, index) => {
        const tabLink = document.createElement('a');
        tabLink.href = "#";
        tabLink.classList.add('tab-link');
        tabLink.textContent = tabName;
        tabLink.setAttribute('data-tab', tabName);
        if (index === 0) {
            tabLink.classList.add('active'); // Ativa a primeira aba por padrão
        }
        tabLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(tabName);
        });
        navTabs.appendChild(tabLink);
    });
}

// Renderiza a grelha de vídeos para a aba ativa
function renderVideoGrid(tabName) {
    videoGridContainer.innerHTML = ''; // Limpa a grelha
    currentPlaylist = videoData[tabName]; // Define a playlist atual

    if (!currentPlaylist) {
        videoGridContainer.innerHTML = '<p>Nenhum vídeo encontrado para esta categoria.</p>';
        return;
    }

    currentPlaylist.forEach((video, index) => {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
        videoCard.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-category">${video.category}</p>
            </div>
        `;
        videoCard.addEventListener('click', () => {
            playVideo(video.id, index);
        });
        videoGridContainer.appendChild(videoCard);
    });
}

// Troca de abas
function switchTab(tabName) {
    // Remove 'active' de todas as abas
    document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
    // Adiciona 'active' à aba clicada
    document.querySelector(`.tab-link[data-tab="${tabName}"]`).classList.add('active');
    
    renderVideoGrid(tabName); // Renderiza a grelha para a nova aba
}

// Toca um vídeo específico
function playVideo(videoId, index) {
    currentVideoIndex = index;
    if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
        overlayEndScreen.classList.add('hidden'); // Esconde a tela final
    } else {
        // Se o player ainda não carregou, configura o primeiro vídeo para quando estiver pronto
        // Isso é mais complexo com a API do YouTube, normalmente o `onYouTubeIframeAPIReady` já teria sido chamado.
        // Para simplificar, assumimos que o player estará pronto.
        console.warn('Player do YouTube não está pronto. Tente novamente ou aguarde.');
    }
}

// --- Eventos da Tela Final ---
replayButton.addEventListener('click', () => {
    if (player && player.seekTo) {
        player.seekTo(0); // Volta para o início
        player.playVideo(); // Toca o vídeo
    }
});

nextButton.addEventListener('click', () => {
    currentVideoIndex++;
    if (currentVideoIndex < currentPlaylist.length) {
        playVideo(currentPlaylist[currentVideoIndex].id, currentVideoIndex);
    } else {
        // Se for o último vídeo, volta para o primeiro ou faz outra coisa
        alert('Fim da playlist!');
        currentVideoIndex = 0; // Volta ao primeiro
        playVideo(currentPlaylist[currentVideoIndex].id, currentVideoIndex);
    }
});

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    renderTabs();
    // Garante que a primeira aba e sua grelha sejam carregadas ao iniciar
    const firstTabName = Object.keys(videoData)[0];
    if (firstTabName) {
        switchTab(firstTabName);
    } else {
        videoGridContainer.innerHTML = '<p>Nenhum vídeo configurado. Adicione vídeos ao objeto videoData.</p>';
    }
});