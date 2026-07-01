const CATEGORIAS_VALIDAS = [
  "triste", "ansioso", "medo", "cansado", "desanimado",
  "confuso", "raiva", "solitario", "grato", "feliz", "paz", "neutro",
];

/**
 * Envia o relato de sentimento da pessoa para a Groq e recebe de volta
 * uma palavra motivacional em português + a categoria emocional detectada.
 * Se a API falhar por qualquer motivo, cai em um retorno padrão seguro.
 */
async function gerarPalavraMotivacional(nomeUsuario, textoSentimento) {
  const apiKey = process.env.GROQ_API_KEY;
  const modelo = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    return fallback(textoSentimento);
  }

  const systemPrompt = `Você é um conselheiro cristão gentil e acolhedor, parte do app "Discipulador.IA".
Sua tarefa: ler o relato de sentimento de uma pessoa e responder APENAS com um JSON válido, sem markdown, sem texto extra, no formato exato:
{"mensagem": "uma mensagem motivacional cristã, calorosa, de 3 a 5 frases, escrita em português do Brasil, citando o nome da pessoa quando fizer sentido, sem citar versículos diretamente", "categoria": "uma das opções: ${CATEGORIAS_VALIDAS.join(", ")}"}
Escolha a categoria que melhor representa o estado emocional descrito. Se não for possível identificar claramente, use "neutro".`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelo,
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Nome da pessoa: ${nomeUsuario}\nComo ela disse que está se sentindo hoje: "${textoSentimento}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Erro na API Groq:", response.status, await response.text());
      return fallback(textoSentimento);
    }

    const data = await response.json();
    const bruto = data?.choices?.[0]?.message?.content?.trim() || "";
    const limpo = bruto.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpo);

    const categoria = CATEGORIAS_VALIDAS.includes(parsed.categoria) ? parsed.categoria : "neutro";
    const mensagem = typeof parsed.mensagem === "string" && parsed.mensagem.length > 0
      ? parsed.mensagem
      : fallback(textoSentimento).mensagem;

    return { mensagem, categoria };
  } catch (erro) {
    console.error("Falha ao chamar a Groq:", erro.message);
    return fallback(textoSentimento);
  }
}

function fallback(textoSentimento) {
  return {
    mensagem: "Seja qual for o seu momento agora, saiba que você não está sozinho. Deus conhece cada detalhe do que você está vivendo e caminha ao seu lado. Respire fundo, confie e dê o próximo passo com fé.",
    categoria: "neutro",
  };
}

module.exports = { gerarPalavraMotivacional, CATEGORIAS_VALIDAS };
