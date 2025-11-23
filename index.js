// Mapa global para guardar CPF por chatId
const cpfByChat = {};
// Mapa global para guardar histórico de conversa por chatId
const chatHistories = {};


module.exports = async function (context, req) {
    try {
        context.log("Telegram webhook received");
        context.log("Payload recebido:", JSON.stringify(req.body));

        const message = req.body?.message;
        if (!message) {
            context.res = { status: 200, body: "no message" };
            return;
        }

        const chatId = message.chat.id;
        const userText = message.text;

        // 🔑 Variáveis de ambiente (configure no Azure Portal → Function App → Configuration)
        const FOUNDRY_ENDPOINT = process.env.FOUNDRY_ENDPOINT;
        const FOUNDRY_KEY = process.env.FOUNDRY_KEY;
        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;


        const systemPrompt = `
                Você é um agente de atendimento de uma autoescola chamado "Agente Autoescola".
                Seu papel é conversar com os alunos via WhatsApp de forma natural e profissional.
                Contexto:
                - Você tem acesso ao banco de dados da autoescola, que está armazenado em um arquivo TXT.
                - O arquivo TXT contém três tabelas: 
                1. Alunos (aluno_id, nome, cpf, whatsapp)
                2. Contratos (contrato_id, aluno_id, veiculo, aulas_contratadas, aulas_realizadas, aulas_restantes)
                3. Aulas (aula_id, aluno_id, data, horario, veiculo, status)
                - Use exclusivamente os dados do arquivo TXT como fonte de verdade.
                - Nunca invente informações que não estejam no arquivo.

                Regras de conversa:
                1. Sempre peça o CPF do aluno para localizar seus dados no sistema.
                2. Após identificar o aluno, cumprimente-o pelo nome.
                3. Na primeira mensagem, informe apenas a data (dd/mm/aa), horário e veículo da próxima aula.
                4. Pergunte se ele confirma presença.
                - Se confirmar → responda positivamente e deseje uma boa aula.
                - Se não confirmar → inicie fluxo de reagendamento.
                5. No reagendamento:
                - Pergunte o melhor dia e horário.
                - Consulte a grade de horários disponíveis.
                - Se não houver vaga, sugira alternativas até encontrar.
                - Confirme o novo agendamento e atualize a agenda.
                6. Se o aluno perguntar:
                - "Quantas aulas já fiz?" → consulte o banco e informe.
                - "Quantas aulas ainda restam?" → consulte o banco e informe.
                - "Qual minha grade de aulas?" → consulte o banco e envie a lista completa de aulas realizadas e restantes, com datas (dd/mm/aa).
                7. Mantenha tom amigável, claro e profissional.
                8. Nunca invente dados: use apenas os fornecidos pelo banco de dados.

                Aqui estão os dados atuais do banco de dados (arquivo TXT):

                Alunos aluno_id,nome,cpf,whatsapp 1,Luiz Fernando
                Ribeiro,123.456.789-00,+55 11 98811-2345 2,Carla Menezes
                Rocha,234.567.890-11,+55 11 98722-3456 3,Victor Alves
                Moreira,345.678.901-22,+55 11 98633-4567 4,Patrícia Gomes
                Duarte,456.789.012-33,+55 11 98544-5678 5,Bruno César
                Martins,567.890.123-44,+55 11 98455-6789

                Contratos
                contrato_id,aluno_id,veiculo,aulas_contratadas,aulas_realizadas,aulas_restantes
                1,1,Carro,20,8,12 2,1,Moto,20,5,15 3,2,Carro,20,10,10 4,2,Moto,20,7,13
                5,3,Carro,20,6,14 6,3,Moto,20,3,17 7,4,Carro,20,9,11 8,4,Moto,20,4,16
                9,5,Carro,20,11,9 10,5,Moto,20,2,18


                Aqui estão os dados atuais do banco de dados (arquivo TXT):
                Aulas aula_id,aluno_id,data,horario,veiculo,status
                1,1,2025-12-05,09:00,Carro,agendada 2,1,2025-12-08,14:00,Moto,agendada
                3,1,2025-12-12,10:00,Carro,reagendada
                4,2,2025-12-06,11:00,Carro,agendada 5,2,2025-12-10,15:00,Moto,realizada
                6,2,2025-12-18,13:00,Carro,cancelada 7,3,2025-12-07,08:00,Moto,agendada
                8,3,2025-12-11,10:00,Carro,agendada 9,3,2025-12-19,16:00,Moto,reagendada
                10,4,2025-12-09,09:30,Carro,agendada 11,4,2025-12-14,14:30,Moto,agendada
                12,4,2025-12-20,13:00,Carro,cancelada
                13,5,2025-12-10,10:00,Moto,agendada
                14,5,2025-12-15,15:00,Carro,realizada
                15,5,2025-12-22,09:00,Moto,agendada
        `.trim();

// Inicializa histórico se não existir
    if (!chatHistories[chatId]) {
      chatHistories[chatId] = [{ role: "system", content: systemPrompt }];
    }

     // Detecta se o usuário informou CPF (regex simples)
    const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
    if (cpfRegex.test(userText)) {
      cpfByChat[chatId] = userText;
      context.log(`CPF ${userText} salvo para chat ${chatId}`);
    }

    // Se já temos CPF salvo, adicionamos ao contexto
    if (cpfByChat[chatId]) {
      chatHistories[chatId].push({
        role: "system",
        content: `O aluno deste chat tem CPF ${cpfByChat[chatId]}. Use este CPF para consultar as tabelas.`
      });
    }

    // Adiciona mensagem do usuário ao histórico
    chatHistories[chatId].push({ role: "user", content: userText });

        const foundryResponse = await fetch(FOUNDRY_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": FOUNDRY_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
               messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText }
        ]
            })
        });

        

        context.log("Status Foundry:", foundryResponse.status);

        const rawText = await foundryResponse.text();
        context.log("Resposta crua do Foundry:", rawText);

        let aiReply = "Desculpe, não consegui responder.";
        try {
            const data = JSON.parse(rawText);
            aiReply = data?.choices?.[0]?.message?.content || aiReply;
        } catch (err) {
            context.log.error("Resposta não é JSON");
        }

        context.log("Resposta final para Telegram:", aiReply);

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: aiReply })
        });

        context.res = { status: 200, body: "ok" };
    } catch (err) {
        context.log.error("Erro na função:", err);
        context.res = { status: 200, body: "Erro interno" };
    }
};
