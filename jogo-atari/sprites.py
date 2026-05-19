import pygame
import random
from config import *

class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # Cria a imagem da nave com fundo transparente
        self.image = pygame.Surface((PLAYER_WIDTH, PLAYER_HEIGHT), pygame.SRCALPHA)
        # Desenha um polígono no formato de nave (estilo nave espacial clássica)
        pontos_nave = [
            (PLAYER_WIDTH // 2, 0),                  # Bico da nave
            (0, PLAYER_HEIGHT),                      # Asa Esquerda
            (PLAYER_WIDTH // 2, PLAYER_HEIGHT - 10), # Base central (detalhe)
            (PLAYER_WIDTH, PLAYER_HEIGHT)            # Asa Direita
        ]
        pygame.draw.polygon(self.image, PLAYER_COLOR, pontos_nave)
        # Posiciona no centro inferior da tela
        self.rect = self.image.get_rect()
        self.rect.centerx = WIDTH // 2
        self.rect.bottom = HEIGHT - 20
        self.speedx = 0

    def update(self):
        # Reseta velocidade
        self.speedx = 0
        
        # Pega as teclas pressionadas
        keystate = pygame.key.get_pressed()
        if keystate[pygame.K_LEFT]:
            self.speedx = -PLAYER_SPEED
        if keystate[pygame.K_RIGHT]:
            self.speedx = PLAYER_SPEED
            
        # Move a nave
        self.rect.x += self.speedx
        
        # Limita na tela para não sair pelas bordas
        if self.rect.right > WIDTH:
            self.rect.right = WIDTH
        if self.rect.left < 0:
            self.rect.left = 0

    def shoot(self, all_sprites, bullets):
        # Cria um novo tiro na posição central superior da nave
        bullet = Bullet(self.rect.centerx, self.rect.top)
        all_sprites.add(bullet)
        bullets.add(bullet)


class Asteroid(pygame.sprite.Sprite):
    def __init__(self, speed_multiplier=1.0):
        super().__init__()
        # Tamanho aleatório
        size = random.randint(ASTEROID_SIZE_MIN, ASTEROID_SIZE_MAX)
        self.image = pygame.Surface((size, size), pygame.SRCALPHA)
        # Desenha um círculo principal para o asteroide
        pygame.draw.circle(self.image, ASTEROID_COLOR, (size // 2, size // 2), size // 2)
        # Desenha uma pequena "cratera" mais escura para dar textura
        cratera_color = (max(0, ASTEROID_COLOR[0]-80), max(0, ASTEROID_COLOR[1]-80), max(0, ASTEROID_COLOR[2]-80))
        pygame.draw.circle(self.image, cratera_color, (size // 3, size // 3), size // 5)
        
        self.rect = self.image.get_rect()
        
        # Posição inicial aleatória no topo, acima da tela visível
        self.rect.x = random.randrange(0, WIDTH - self.rect.width)
        self.rect.y = random.randrange(-100, -40)
        
        # Velocidade aleatória com multiplicador de dificuldade
        base_speed = random.randint(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED)
        self.speedy = int(base_speed * speed_multiplier)
        
        # Garante que a velocidade nunca seja 0
        if self.speedy < 1:
            self.speedy = 1

    def update(self):
        # Move para baixo
        self.rect.y += self.speedy


class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        # Cria a imagem do tiro com fundo transparente
        self.image = pygame.Surface((BULLET_WIDTH, BULLET_HEIGHT), pygame.SRCALPHA)
        # Desenha uma elipse para dar um efeito mais laser/arredondado
        pygame.draw.ellipse(self.image, BULLET_COLOR, (0, 0, BULLET_WIDTH, BULLET_HEIGHT))
        self.rect = self.image.get_rect()
        
        # Posiciona onde foi chamado (ponta da nave)
        self.rect.bottom = y
        self.rect.centerx = x
        self.speedy = -BULLET_SPEED

    def update(self):
        # Move para cima
        self.rect.y += self.speedy
        
        # Destrói o tiro se sair da tela (pelo topo)
        if self.rect.bottom < 0:
            self.kill()
