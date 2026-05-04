def eh_primo(numero):
    """
    Verifica se um número é primo.
    """
    if numero <= 1:
        return False
    
    for i in range(2, int(numero ** 0.5) + 1):
        if numero % i == 0:
            return False
    
    return True


def listar_primos(limite):
    """
    Retorna uma lista de números primos até o limite informado.
    """
    primos = []
    
    for num in range(2, limite + 1):
        if eh_primo(num):
            primos.append(num)
    
    return primos


# Execução principal
if __name__ == "__main__":
    limite = int(input("Digite um número limite: "))
    resultado = listar_primos(limite)
    
    print("\nNúmeros primos até", limite, ":")
    print(resultado)