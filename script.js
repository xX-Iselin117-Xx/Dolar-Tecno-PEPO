async function cargarDolares() {
  try {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    const fechaFormateada = hoy.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    document.querySelector(".fecha strong").textContent = fechaFormateada;

    const tipos = [
      { nombre: "oficial", id: "oficial" },
      { nombre: "blue", id: "blue" },
      { nombre: "bolsa", id: "mep" },
      { nombre: "contadoconliqui", id: "ccl" },
    ];

    const ayerFecha = ayer.toISOString().split("T")[0];

    for (const tipo of tipos) {
      // Obtener precio actual
      const hoyRes = await fetch(`https://dolarapi.com/v1/dolares/${tipo.nombre}`);
      const hoyData = await hoyRes.json();

      // Obtener precio del día anterior
      let ayerData = null;
      try {
        const ayerRes = await fetch(`https://dolarapi.com/v1/dolares/${tipo.nombre}/historico/${ayerFecha}`);
        if (ayerRes.ok) {
          ayerData = await ayerRes.json();
        }
      } catch (err) {
        console.warn(`No se pudo obtener histórico de ${tipo.nombre}`);
      }

      // Mostrar precio actual
      document.getElementById(`${tipo.id}-compra`).textContent = `$${hoyData.compra}`;
      document.getElementById(`${tipo.id}-venta`).textContent = `$${hoyData.venta}`;

      // Mostrar variación
      if (ayerData) {
        const compraVar = calcularVariacion(hoyData.compra, ayerData.compra);
        const ventaVar = calcularVariacion(hoyData.venta, ayerData.venta);
        agregarVariacion(`${tipo.id}-compra`, compraVar);
        agregarVariacion(`${tipo.id}-venta`, ventaVar);
      } else {
        agregarMensajeSinDatos(`${tipo.id}-compra`);
        agregarMensajeSinDatos(`${tipo.id}-venta`);
      }
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

function calcularVariacion(actual, anterior) {
  const variacion = ((actual - anterior) / anterior) * 100;
  return parseFloat(variacion.toFixed(2));
}

function agregarVariacion(id, variacion) {
  const el = document.getElementById(id);
  const span = document.createElement("span");
  span.textContent = `${variacion > 0 ? "▲" : "▼"} ${Math.abs(variacion)}%`;
  span.style.color = variacion > 0 ? "red" : "green";
  span.style.display = "block";
  span.style.fontSize = "0.9em";
  el.appendChild(span);
}

function agregarMensajeSinDatos(id) {
  const el = document.getElementById(id);
  const span = document.createElement("span");
  span.textContent = "Sin datos previos";
  span.style.color = "gray";
  span.style.display = "block";           // debajo del precio
  span.style.fontSize = "0.33em";         // texto más pequeño
  span.style.whiteSpace = "nowrap";       // evita salto de línea
  span.style.overflow = "hidden";
  span.style.textOverflow = "ellipsis";   // recorta si es demasiado largo
  el.appendChild(span);
}

cargarDolares();
setInterval(cargarDolares, 21600000); // cada 6
