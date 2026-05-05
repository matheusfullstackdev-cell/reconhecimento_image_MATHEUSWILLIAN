def eh_primo(numero):
    """
    Verifica se um número é primo.

    Args:
        numero (int): O número a ser verificado se é primo.

    Returns:
        bool: True se o número for primo, False caso contrário.
    """
    if numero <= 1:
        return False  # Números menores ou iguais a 1 não são primos
    
    for i in range(2, int(numero ** 0.5) + 1):  # Verifica divisores até a raiz quadrada para eficiência
        if numero % i == 0:
            return False  # Se divisível por i, não é primo
    
    return True  # Se nenhum divisor encontrado, é primo


def listar_primos(limite):
    """
    Retorna uma lista de números primos até o limite informado.

    Args:
        limite (int): O número limite até o qual os primos serão listados.

    Returns:
        list: Uma lista contendo todos os números primos de 2 até o limite.
    """
    primos = []
    
    for num in range(2, limite + 1):  # Itera de 2 até o limite
        if eh_primo(num):
            primos.append(num)  # Adiciona se for primo
    
    return primos


# Execução principal
if __name__ == "__main__":
    limite = int(input("Digite um número limite: "))
    resultado = listar_primos(limite)
    
    print("\nNúmeros primos até", limite, ":")
    print(resultado)