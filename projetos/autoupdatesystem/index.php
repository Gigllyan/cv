<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minha Aplicação</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Minha Aplicação Web</h1>
            <p class="version">Versão: <?php echo isset($updater) ? $updater->getCurrentVersion() : '1.2.3'; ?></p>
        </header>
        
        <main>
            <section class="welcome">
                <h2>Bem-vindo!</h2>
                <p>Esta é uma aplicação com sistema de auto-atualização.</p>
            </section>
            
            <section class="features">
                <h3>Recursos:</h3>
                <ul>
                    <li>Auto-atualização via GitHub</li>
                    <li>Funcionamento offline</li>
                    <li>Interface responsiva</li>
                </ul>
            </section>
            <section>
                <div class="status">checando status...</div>
            </section>
        </main>
        
        <footer>
            <p>&copy; 2025 - Sistema Auto-Atualizável</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
    <script >
        document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema Auto-Atualizável carregado - Versão 1.0');
    
    // Verifica o status da conexão
    function checkConnectionStatus() {
        const statusElement = document.querySelector('.status');
        if (navigator.onLine) {
            if (statusElement) {
                statusElement.innerHTML = '<span class="online">✓ Online - Verificação automática ativa</span>';
            }
        } else {
            if (statusElement) {
                statusElement.innerHTML = '<span class="offline">⚠ Offline - Modo local</span>';
            }
        }
    }
    
    // Monitora mudanças na conexão
    window.addEventListener('online', checkConnectionStatus);
    window.addEventListener('offline', checkConnectionStatus);
    
    // Verifica status inicial
    checkConnectionStatus();
    
    // Adiciona animação suave aos elementos
    const elements = document.querySelectorAll('.container > *');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Log de debug
    console.log('Recursos carregados:', {
        css: document.querySelector('link[href="style.css"]') ? 'OK' : 'Erro',
        container: document.querySelector('.container') ? 'OK' : 'Erro'
    });
});

    </script>
</body>
</html>
