<script>
  import { createEventDispatcher } from 'svelte';
  import Swal from 'sweetalert2';

  const dispatch = createEventDispatcher();

  export let rifados = [];
  export let currentData = [];

  let participants = [];
  $: {
    if (participants.length === 0 && currentData.length > 0) {
      participants = JSON.parse(JSON.stringify(currentData));
    }
  }
  let searchTerm = '';

  const RIFADOS_KEY = 'gruposRifados';

  function saveChanges() {
    dispatch('save', { newData: participants });
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los cambios se han aplicado correctamente.',
      timer: 1500,
      showConfirmButton: false
    });
  }

  function addParticipant() {
    participants = [{ label: "NUEVO ESTUDIANTE-GRADO" }, ...participants];
  }

  function removeParticipant(index) {
    participants = participants.filter((_, i) => i !== index);
  }

  function removeRifado(grado) {
    const updatedRifados = rifados.filter(g => g !== grado);
    localStorage.setItem(RIFADOS_KEY, JSON.stringify(updatedRifados));
    dispatch('updateRifados', { newRifados: updatedRifados });
  }

  function clearRifados() {
    Swal.fire({
      title: '¿Reiniciar sorteo?',
      text: "Se borrará la lista de grupos que ya ganaron.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(RIFADOS_KEY);
        dispatch('clearRifados');
      }
    });
  }

  function close() {
    dispatch('close');
  }

  $: filteredParticipants = participants.filter(p => 
    p && p.label && p.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
</script>

<div class="settings-overlay">
  <div class="settings-modal">
    <header>
      <h2>Configuración de la Rifa</h2>
      <button class="close-btn" on:click={close}>&times;</button>
    </header>

    <div class="content">
      <div class="top-actions">
        <section class="rifados-section">
          <h3>Grupos Participantes ({rifados.length})</h3>
          <div class="rifados-container">
            {#if rifados.length > 0}
              <div class="rifados-list">
                {#each rifados as grado}
                  <button 
                    class="rifado-tag clickable" 
                    on:click={() => removeRifado(grado)}
                    title="Click para resetear este grado"
                  >
                    {grado} <span class="remove-icon">×</span>
                  </button>
                {/each}
              </div>
              <button class="danger-btn" on:click={clearRifados}>Limpiar Historial</button>
            {:else}
              <p class="empty-msg">Nadie ha participado todavía.</p>
            {/if}
          </div>
        </section>
      </div>

      <section class="table-section">
        <div class="table-header-actions">
          <h3>Lista de Estudiantes ({participants.length})</h3>
          <div class="search-box">
            <input type="text" placeholder="Buscar..." bind:value={searchTerm} />
          </div>
          <button class="add-btn" on:click={addParticipant}>+ Añadir</button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre y Grado (FORMATO: NOMBRE-GRADO)</th>
                <th style="width: 80px;">Acción</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredParticipants as p, i}
                <tr>
                  <td>
                    <input type="text" bind:value={p.label} class="table-input" />
                  </td>
                  <td>
                    <button class="remove-btn" on:click={() => removeParticipant(i)}>Eliminar</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <footer>
      <button class="cancel-btn" on:click={close}>Cancelar</button>
      <button class="save-btn" on:click={saveChanges}>Guardar Todo</button>
    </footer>
  </div>
</div>

<style>
  .settings-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 11000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .settings-modal {
    background: #fef9c3;
    width: min(900px, 100%);
    max-height: 90vh;
    border-radius: 24px;
    border: 3px solid #eab308;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #052e23;
  }

  header {
    padding: 15px 25px;
    background: #047857;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  header h2 { font-size: 1.5rem; margin: 0; font-family: 'Fraunces', serif; }

  .content {
    padding: 25px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  h3 { margin: 0 0 10px; font-size: 1.1rem; color: #065f46; border-left: 4px solid #eab308; padding-left: 10px; }

  .rifados-container {
    background: rgba(234, 179, 8, 0.1);
    padding: 15px;
    border-radius: 12px;
    border: 1px dashed #eab308;
  }

  .rifados-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .rifado-tag { background: #065f46; color: white; padding: 3px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
  
  .rifado-tag.clickable {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    border: 1px solid transparent;
  }

  .rifado-tag.clickable:hover {
    background: #047857;
    border-color: #eab308;
    transform: scale(1.05);
  }

  .remove-icon {
    font-size: 1.1rem;
    opacity: 0.7;
  }

  .rifado-tag.clickable:hover .remove-icon {
    opacity: 1;
    color: #eab308;
  }

  .table-header-actions { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
  .search-box { flex: 1; min-width: 200px; }
  .search-box input { width: 100%; padding: 8px 15px; border-radius: 8px; border: 1px solid #eab308; background: white; }

  .table-container { 
    border: 1px solid #eab308;
    border-radius: 12px;
    overflow: hidden;
    background: white;
  }

  table { width: 100%; border-collapse: collapse; text-align: left; }
  th { background: #fef9c3; padding: 12px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #eab308; }
  td { padding: 8px 12px; border-bottom: 1px solid #eee; }

  .table-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    font-size: 0.95rem;
  }

  .table-input:focus {
    border-color: #047857;
    background: #f0fdf4;
    outline: none;
  }

  footer {
    padding: 20px 25px;
    background: #fef9c3;
    border-top: 2px solid #eab308;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  button {
    font-weight: 700;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    transition: all 0.15s;
    font-size: 0.9rem;
  }

  .add-btn { background: #047857; color: white; padding: 8px 20px; }
  .save-btn { background: #047857; color: white; padding: 12px 30px; font-size: 1rem; }
  .cancel-btn { background: #eee; color: #666; padding: 12px 25px; }
  .remove-btn { background: #fee2e2; color: #991b1b; padding: 4px 10px; font-size: 0.75rem; }
  .danger-btn { background: #ef4444; color: white; padding: 6px 15px; font-size: 0.8rem; }
  .close-btn { background: none; color: white; font-size: 2rem; padding: 0 10px; border-radius: 0; }

  button:hover { opacity: 0.9; transform: translateY(-1px); }
  button:active { transform: translateY(0); }

  .empty-msg { font-size: 0.9rem; color: #888; font-style: italic; }
</style>

