# Código com debug

def dividir(a, b):
    try:
        resultado = a / b
        return resultado
    except ZeroDivisionError:
        print("Erro: divisão por zero não é permitida.")
        return None


def main():
    print("Teste 1:", dividir(10, 2))   # OK
    print("Teste 2:", dividir(10, 0))   # Erro tratado


if __name__ == "__main__":
    main()