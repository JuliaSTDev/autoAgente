# AutoAgente 🚗🏍️

## 📌 Descrição
O **AutoAgente** é um agente de inteligência artificial desenvolvido como projeto de conclusão de curso.  
Ele utiliza o modelo **GPT-4.1 mini** no Microsoft Azure AI Foundry e se conecta ao **Telegram** via Azure Function.  
O objetivo é auxiliar alunos de uma autoescola, consultando dados de suas aulas e contratos, confirmando presença e permitindo reagendamento.

## 🎯 Objetivo
- Confirmar a próxima aula de direção (carro ou moto).
- Informar ao aluno quantas aulas já foram realizadas e quantas faltam.
- Retornar a agenda completa de aulas.
- Permitir reagendamento de aulas.

## ⚙️ Tecnologias utilizadas
- Microsoft Azure AI Foundry (modelo GPT-4.1 mini)
- Azure Functions (Node.js)
- Telegram Bot API
- Planilha Excel como banco de dados

## 📂 Estrutura do banco de dados
- **Alunos**: aluno_id, nome, cpf, whatsapp  
- **Contratos**: contrato_id, aluno_id, veiculo, aulas_contratadas, aulas_realizadas, aulas_restantes  
- **Aulas**: aula_id, aluno_id, data, horario, veiculo, status  

## 🚀 Fluxo de funcionamento
1. O aluno envia mensagem pelo Telegram.
2. O agente pede o CPF (apenas uma vez).
3. O agente consulta os dados na planilha Excel.
4. O agente confirma a próxima aula e pergunta se confirma presença.
5. Se não confirmar, inicia fluxo de reagendamento.
6. O agente também responde perguntas sobre aulas realizadas, aulas restantes e agenda completa.

## 🖼️ Prints de execução

### 1. Teste no Playground do Foundry
![Playground do agente](playgroundAgente.png)

### 2. Azure Function rodando
![Logs da Azure Function](azureFunction.png)

### 3. Bot do Telegram funcionando
![Bot do Telegram](botTelegram.png)



## 🔗 Referências
- [Microsoft Azure AI Foundry](https://learn.microsoft.com/azure/ai/)
- [Azure Functions](https://learn.microsoft.com/azure/azure-functions/)
- [Telegram Bot API](https://core.telegram.org/bots/api)


---

## 📖 Passo a passo realizado

1. Criação do modelo no Foundry IA.  
2. Criação do agente, configuração do prompt e importação da planilha Excel.  
3. Criação de uma **Action** conectando à Azure Function.  
4. Teste no Playground do agente (print incluído).  
5. Criação do bot no Telegram e obtenção do token.  
6. Desenvolvimento da Azure Function em JavaScript para conectar ao bot.  
7. Teste do bot no Telegram (print incluído).  

---

## 🎥 Opcional
Um vídeo mostrando o passo a passo pode ser incluído para complementar a entrega.
