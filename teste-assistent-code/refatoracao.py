# Código refatorado (mais limpo e eficiente)

def calcular_estatisticas(numeros: list) -> tuple:
    """
    Retorna soma, média e maior valor de uma lista
    """
    if not numeros:
        return 0, 0, 0

    soma = sum(numeros)
    media = soma / len(numeros)
    maior = max(numeros)

    return soma, media, maior


def main():
    lista = [10, 20, 30, 40, 50]

    soma, media, maior = calcular_estatisticas(lista)

    print("Lista:", lista)
    print("Soma:", soma)
    print("Média:", media)
    print("Maior:", maior)


if __name__ == "__main__":
    main()