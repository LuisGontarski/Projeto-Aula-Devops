# Usar uma imagem base oficial do Node.js (versão 20.14.0-alpine)
FROM node:20.14.0-alpine

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o package.json e o package-lock.json (se existir)
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante dos arquivos da aplicação para o diretório de trabalho
COPY html/ /app/

# Expor a porta que a aplicação vai usar (por exemplo, 3000)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "app.js"]
