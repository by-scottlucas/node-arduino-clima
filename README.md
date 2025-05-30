# Node.js - Arduino Clima

Projeto de uma aplicação Node.js que busca dados climáticos da API da OpenWeather  e envia as informações para uma placa Arduino conectada via porta serial. O Arduino exibe os dados recebidos (cidade, temperatura, umidade e descrição do clima) em um display LCD I2C.


## Tecnologias Utilizadas

* **Node.js** – Plataforma para execução do código backend
    * **serialport** – Comunicação serial com o Arduino
    * **dotenv** – Gerenciamento de variáveis de ambiente
* **Arduino (C++)** – Código embarcado que lê dados da porta serial e exibe no LCD
  * **LiquidCrystal\_I2C** – Biblioteca para controle do display LCD I2C
* **OpenWeather API** – Fonte dos dados climáticos consumidos pelo Node.js


## Estrutura do repositório

```

/node-arduino-clima
│
├── /arduino
│   └── clima-display.ino       # Código Arduino para exibir dados no LCD
├── index.js                    # Código principal da API Node.js
├── package.json
├── README.md
└── .env.example                # Exemplo de arquivo de configuração de variáveis ambiente

````


## Configuração e instalação

1. Clone o repositório:

```bash
git clone https://github.com/by-scottlucas/node-arduino-clima.git
cd node-arduino-clima
````

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` baseado no `.env.example` para configurar as variáveis de ambiente necessárias, como chave de API do serviço de clima, porta serial, etc.

---

## Código Arduino

O código Arduino responsável pela exibição dos dados está dentro da pasta `/arduino` no arquivo `clima-display.ino`.

### Como usar o código Arduino:

1. Abra o arquivo `clima-display.ino` na IDE Arduino.
2. Verifique o endereço I2C do seu display LCD (comum: 0x27 ou 0x3F).
3. Conecte seu Arduino ao computador.
4. Faça o upload do código para a placa.
5. A taxa de comunicação serial deve ser 9600 baud para sincronizar com o Node.js.

O Arduino irá receber dados via serial e mostrar as informações no display LCD em ciclos, atualizando conforme os dados chegam.


## Como executar a aplicação

1. Certifique-se de que o Arduino está conectado e com o código carregado.
2. Configure a porta serial correta no arquivo `.env` (exemplo: `SERIAL_PORT=/dev/ttyUSB0` ou `COM3` no Windows).
3. Execute a aplicação Node.js:

```bash
npm run start
```

4. A aplicação vai buscar dados do clima e enviar para o Arduino automaticamente.


## **Licença**

Este projeto está licenciado sob a **[Licença MIT](./LICENSE)** .


## **Autor**

Este projeto foi desenvolvido por **Lucas Santos Silva**, Desenvolvedor Full Stack, graduado pela **Escola Técnica do Estado de São Paulo (ETEC)** nos cursos de **Informática (Suporte)** e **Informática para Internet**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/bylucasss/)

## Considerações finais

Este projeto é ideal para quem quer integrar dados do mundo digital (API de clima) com um hardware físico (Arduino e display LCD), que foi o meu caso.
Optei por Manter o código Arduino dentro do mesmo repositório para facilitar o uso e a manutenção do projeto.