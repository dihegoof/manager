// ======================
// 🔢 MAPA DE NÚMEROS
// ======================
const numeros = {
  zero: 0,
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10
};

// ======================
// 🧠 NORMALIZA TEXTO
// ======================
export function norm(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ======================
// 🧼 LIMPA NOME (MELHORADO)
// ======================
function limparNome(nome) {
  return nome
    .replace(/^(de|do|da|dos|das|o|a|os|as|um|uma|uns|umas)\s+/i, "")
    .replace(/\b(de|do|da|dos|das)\b/g, "")
    .trim();
}

// ======================
// 🔢 EXTRAI QUANTIDADE (MELHORADO)
// ======================
function extrairQuantidade(texto) {
  const partes = texto.split(" ");
  let quantidade = 1;
  
  // número tipo "2 arroz"
  if (!isNaN(partes[0])) {
    quantidade = Number(partes[0]);
    partes.shift();
  }
  
  // número por palavra
  else if (numeros[partes[0]] !== undefined) {
    quantidade = numeros[partes[0]];
    partes.shift();
  }
  
  return {
    quantidade,
    nome: partes.join(" ")
  };
}

// ======================
// 🧠 DETECTA TIPO
// ======================
function detectarTipo(texto) {
  if (/add|adicionar|adiciona|comprei|ganhei|recebi|coloca|precisa/.test(texto)) return "add";
  
  if (/remover|tirar|consumir|usei|gastei|acabou/.test(texto)) return "consumir";
  
  if (/editar|alterar|mudar/.test(texto)) return "editar";
  
  if (/deletar|excluir|apagar/.test(texto)) return "deletar";
  
  return null;
}

// ======================
// 🧠 PARSER MELHORADO
// ======================
function parse(texto) {
  texto = norm(texto);
  
  // remove comando
  texto = texto.replace(/^(add|adicionar|adiciona|comprei|ganhei|recebi|remover|tirar|consumir|usei|gastei|acabou|editar|alterar|mudar|deletar|excluir|apagar)\s+/, "");
  
  const { quantidade, nome } = extrairQuantidade(texto);
  
  return {
    quantidade,
    nome: limparNome(nome)
  };
}

// ======================
// 🧠 INTERPRETADOR
// ======================
export function interpretar(transcript, lista, callback) {
  const texto = norm(transcript);
  
  const tipo = detectarTipo(texto);
  
  if (!tipo) {
    falar("Não entendi");
    return;
  }
  
  const partes = texto.split(/\s+e\s+|,\s*/);
  
  partes.forEach(parte => {
    const { quantidade, nome } = parse(parte);
    
    if (!nome) return;
    
    callback({ tipo, nome, quantidade });
  });
  
 // falar("Já atualizei pra você");
}

// ======================
// 🎤 VOZ
// ======================
export function iniciarVoz(lista, callback) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("Sem suporte a voz");
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("🎤 Você disse:", transcript);
    
    interpretar(transcript, lista, callback);
  };
  
  recognition.start();
}

// ======================
// 🔊 VOZ RESPOSTA
// ======================
export function falar(texto) {
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "pt-BR";
  
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

// ======================
// 🤖 SIMILARIDADE (CORRIGIDO)
// ======================
export function similaridade(a, b) {
  a = norm(a);
  b = norm(b);
  
  if (a === b) return 1;
  
  let iguais = 0;
  const menor = Math.min(a.length, b.length);
  
  for (let i = 0; i < menor; i++) {
    if (a[i] === b[i]) iguais++;
  }
  
  return iguais / Math.max(a.length, b.length);
}

// ======================
// 🤖 MATCH ITEM
// ======================
export function encontrarItemIA(nome, lista) {
  let melhor = null;
  let score = 0;
  
  for (const item of lista) {
    const s = similaridade(nome, item.name);
    
    if (s > score) {
      score = s;
      melhor = item;
    }
  }
  
  return score > 0.6 ? melhor : null;
}