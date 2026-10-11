import { classifyRequest } from '../server/assistant.js';
if(!process.env.TYPESAFE_API_KEY)throw Error('Configure TYPESAFE_API_KEY no ambiente local.');
for(const [message,expected] of [['Resumo da agenda de hoje','agenda'],['Quais confirmações estão pendentes hoje?','pendencias'],['Sugira uma mensagem para combinar o retorno do pet','mensagem'],['Como uso o financeiro?','ajuda'],['Qual medicamento dou para meu cachorro?','fora']]) {
 const actual=await classifyRequest(message,process.env.TYPESAFE_API_KEY);
 console.log(JSON.stringify({message,expected,actual,pass:actual===expected}));
 if(actual!==expected)process.exitCode=1;
}
