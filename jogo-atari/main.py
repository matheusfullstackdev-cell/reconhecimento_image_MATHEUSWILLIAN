import pygame
import sys
from config import *
from sprites import Player, Asteroid

def main():
    # Inicializa pygame
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Jogo Espacial - Atari Style")
    clock = pygame.Clock()

    # Função auxiliar para desenhar o texto (pontuação) na tela
    font_name = pygame.font.match_font('arial')
    def draw_text(surf, text, size, x, y):
        font = pygame.font.Font(font_name, size)
        text_surface = font.render(text, True, WHITE)
        text_rect = text_surface.get_rect()
        text_rect.midtop = (x, y)
        surf.blit(text_surface, text_rect)

    game_active = True

    while game_active:
        # Criação dos grupos de sprites
        all_sprites = pygame.sprite.Group()
        asteroids = pygame.sprite.Group()
        bullets = pygame.sprite.Group()

        # Cria jogador e adiciona ao grupo
        player = Player()
        all_sprites.add(player)

        # Timer para o spawn inicial de asteroides
        current_spawn_time = ASTEROID_SPAWN_TIME
        pygame.time.set_timer(pygame.USEREVENT, current_spawn_time)

        score = 0
        speed_multiplier = 1.0
        running = True
        game_over = False

        # ---- LOOP PRINCIPAL DO JOGO ----
        while running:
            # Mantém o loop rodando na velocidade correta (FPS)
            clock.tick(FPS)
            
            # 1. Processamento de Eventos (Entradas)
            for event in pygame.event.get():
                # Fecha a janela
                if event.type == pygame.QUIT:
                    running = False
                    game_active = False
                
                # Pressionou tecla
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE:
                        player.shoot(all_sprites, bullets)
                
                # Evento customizado de timer (spawn de asteroide)
                elif event.type == pygame.USEREVENT:
                    a = Asteroid(speed_multiplier)
                    all_sprites.add(a)
                    asteroids.add(a)

            if not running:
                break

            # 2. Atualização (Lógica)
            all_sprites.update()

            # Verifica colisão: Tiro acertou Asteroide?
            # groupcollide(grupo1, grupo2, dokill1, dokill2)
            hits = pygame.sprite.groupcollide(asteroids, bullets, True, True)
            for hit in hits:
                score += 10 # Aumenta pontuação para cada asteroide destruído
                
                # A cada 50 pontos, aumenta a dificuldade gradualmente
                if score > 0 and score % 50 == 0:
                    speed_multiplier += 0.15 # Inimigos ficam 15% mais rápidos
                    # Diminui o tempo de aparição em 10%, respeitando o limite mínimo
                    current_spawn_time = max(ASTEROID_SPAWN_TIME_MIN, int(current_spawn_time * 0.9))
                    pygame.time.set_timer(pygame.USEREVENT, current_spawn_time)

            # Verifica colisão: Asteroide acertou Jogador?
            # spritecollide(sprite, grupo, dokill)
            hits = pygame.sprite.spritecollide(player, asteroids, False)
            if hits:
                running = False # Fim de jogo
                game_over = True

            # Verifica se algum asteroide passou da tela (chegou no fundo)
            for a in asteroids:
                if a.rect.top > HEIGHT:
                    running = False # Fim de jogo
                    game_over = True

            # 3. Renderização (Desenho na tela)
            # Preenche com fundo preto
            screen.fill(BLACK)
            
            # Desenha todos os sprites
            all_sprites.draw(screen)
            
            # Desenha a pontuação
            draw_text(screen, f"Pontos: {score}", 30, 80, 10)

            # Após desenhar tudo, inverte o display para mostrar a nova tela
            pygame.display.flip()

        # ---- TELA DE GAME OVER ----
        if game_over:
            waiting_for_input = True
            while waiting_for_input:
                clock.tick(FPS)
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        waiting_for_input = False
                        game_active = False # Sai completamente do jogo
                    elif event.type == pygame.KEYUP:
                        if event.key == pygame.K_r:
                            waiting_for_input = False # Sai da tela de espera e reinicia o loop externo

                # Renderiza a tela de Game Over
                screen.fill(BLACK)
                draw_text(screen, "GAME OVER", 64, WIDTH // 2, HEIGHT // 4)
                draw_text(screen, f"Pontuação Final: {score}", 30, WIDTH // 2, HEIGHT // 2)
                draw_text(screen, "Pressione 'R' para reiniciar ou feche a janela", 20, WIDTH // 2, HEIGHT * 3 // 4)
                pygame.display.flip()

    # Encerra o jogo quando o loop terminar
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
