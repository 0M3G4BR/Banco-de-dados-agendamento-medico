<script setup>
import { ref, reactive, watch, onMounted } from "vue";

const API = "http://localhost:3000/api";

const medicos = ref([]);
const agendamentos = ref([]);
const erro = ref("");

const filtro = reactive({ medico_id: "", data: "" });
const novo = reactive({ medico_id: "", paciente_nome: "", data_hora: "", observacao: "" });

async function carregarMedicos() {
  try {
    const resp = await fetch(`${API}/medicos`);
    if (!resp.ok) throw new Error("Falha ao carregar médicos");
    medicos.value = await resp.json();
  } catch (e) {
    erro.value = "Não foi possível carregar os médicos. A API está rodando?";
  }
}

async function carregarAgendamentos() {
  try {
    const params = new URLSearchParams();
    if (filtro.medico_id) params.append("medico_id", filtro.medico_id);
    if (filtro.data) params.append("data", filtro.data);

    const resp = await fetch(`${API}/agendamentos?${params}`);
    if (!resp.ok) throw new Error("Falha ao carregar agendamentos");
    agendamentos.value = await resp.json();
    erro.value = "";
  } catch (e) {
    erro.value = "Não foi possível carregar os agendamentos. A API está rodando?";
  }
}

async function agendar() {
  try {
    const resp = await fetch(`${API}/agendamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medico_id: novo.medico_id,
        paciente_nome: novo.paciente_nome,
        data_hora: novo.data_hora.replace("T", " "), // "2026-11-22T15:00" -> "2026-11-22 15:00"
        observacao: novo.observacao,
      }),
    });
    if (!resp.ok) {
      const corpo = await resp.json();
      throw new Error(corpo.erro || "Erro ao agendar");
    }
    // limpa o formulário e recarrega a tabela
    novo.medico_id = "";
    novo.paciente_nome = "";
    novo.data_hora = "";
    novo.observacao = "";
    await carregarAgendamentos();
  } catch (e) {
    erro.value = e.message;
  }
}

async function cancelar(id) {
  if (!confirm("Cancelar este agendamento?")) return;
  try {
    const resp = await fetch(`${API}/agendamentos/${id}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro ao cancelar");
    // remove a linha da tela sem precisar buscar tudo de novo
    agendamentos.value = agendamentos.value.filter((a) => a.id !== id);
  } catch (e) {
    erro.value = e.message;
  }
}

function limparFiltros() {
  filtro.medico_id = "";
  filtro.data = "";
}

// "2026-11-20 14:30:00" -> "20/11/2026 14:30"
function formatarDataHora(texto) {
  const [data, hora] = texto.replace("T", " ").split(" ");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano} ${hora.slice(0, 5)}`;
}

// sempre que um filtro mudar, busca de novo
watch(filtro, carregarAgendamentos);

onMounted(() => {
  carregarMedicos();
  carregarAgendamentos();
});
</script>

<template>
  <main class="container">
    <h1>Agendamento Médico</h1>

    <p v-if="erro" class="erro">{{ erro }}</p>

    <section class="card">
      <h2>Filtros</h2>
      <div class="linha">
        <label>
          Médico
          <select v-model="filtro.medico_id">
            <option value="">Todos</option>
            <option v-for="m in medicos" :key="m.id" :value="m.id">
              {{ m.nome }} ({{ m.especialidade }})
            </option>
          </select>
        </label>
        <label>
          Dia
          <input type="date" v-model="filtro.data" />
        </label>
        <button type="button" @click="limparFiltros">Limpar filtros</button>
      </div>
    </section>

    <section class="card">
      <h2>Novo agendamento</h2>
      <form class="grade-form" @submit.prevent="agendar">
        <label>
          Médico
          <select v-model="novo.medico_id" required>
            <option value="" disabled>Selecione</option>
            <option v-for="m in medicos" :key="m.id" :value="m.id">
              {{ m.nome }} ({{ m.especialidade }})
            </option>
          </select>
        </label>
        <label>
          Paciente
          <input type="text" v-model="novo.paciente_nome" required />
        </label>
        <label>
          Data e hora
          <input type="datetime-local" v-model="novo.data_hora" required />
        </label>
        <label>
          Observação
          <input type="text" v-model="novo.observacao" />
        </label>
        <button type="submit">Agendar</button>
      </form>
    </section>

    <section class="card">
      <h2>Agendamentos</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Especialidade</th>
            <th>Data/Hora</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in agendamentos" :key="a.id">
            <td>{{ a.id }}</td>
            <td>{{ a.paciente_nome }}</td>
            <td>{{ a.medico_nome }}</td>
            <td>{{ a.especialidade }}</td>
            <td>{{ formatarDataHora(a.data_hora) }}</td>
            <td>
              <button type="button" class="perigo" @click="cancelar(a.id)">
                Cancelar / Remover
              </button>
            </td>
          </tr>
          <tr v-if="agendamentos.length === 0">
            <td colspan="6" class="vazio">Nenhum agendamento encontrado.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style>
* { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f2f5f9; margin: 0; color: #222; }
.container { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
.card { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
.linha { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
.grade-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; align-items: end; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
input, select, button { padding: 8px; font-size: 14px; }
button { cursor: pointer; border: none; border-radius: 6px; background: #1e6fd9; color: #fff; }
button.perigo { background: #c0392b; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
th { background: #1e3a5f; color: #fff; }
.erro { background: #fdecea; color: #b71c1c; padding: 12px; border-radius: 6px; }
.vazio { text-align: center; color: #777; }
@media (max-width: 600px) { .grade-form { grid-template-columns: 1fr; } }
</style>