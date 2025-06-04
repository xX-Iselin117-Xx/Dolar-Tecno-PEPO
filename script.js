async function cargarDolares() {
  try {
    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    document.querySelector(".fecha strong").textContent = fechaFormateada;

    const hoyRes = await fetch("https://dolarapi.com/v1/dolares");
    const hoyData = await hoyRes.json();

    const hoyISO = hoy.toISOString().split("T")[0]; // YYYY-MM-DD
    const datosGuardados = JSON.parse(localStorage.getItem("datosPrevios")) || {};
    const fechaGuardada = datosGuardados.fecha;
    const valoresGuardados = datosGuardados.valores || [];

    const tipos = [
      { nombre: "Oficial", id: "oficial" },
      { nombre: "Blue", id: "blue" },
      { nombre: "Bolsa", id: "mep" },
      { nombre: "Contado con liquidación", id: "ccl" },
    ];

    tipos.forEach(tipo => {
      const actual = hoyData.find(d => d.nombre === tipo.nombre);
      const anterior = valoresGuardados.find(d => d.nombre === tipo.nombre);

      if (actual) {
        document.getElementById(`${tipo.id}-compra`).textContent = `$${actual.compra}`;
        document.getElementById(`${tipo.id}-venta`).textContent = `$${actual.venta}`;

        if (anterior) {
          const compraVar = calcularVariacion(actual.compra, anterior.compra);
          const ventaVar = calcularVariacion(actual.venta, anterior.venta);
          agregarVariacion(`${tipo.id}-compra`, compraVar);
          agregarVariacion(`${tipo.id}-venta`, ventaVar);
        } 
        else {
          agregarMensajeSinDatos(`${tipo.id}-compra`);
          agregarMensajeSinDatos(`${tipo.id}-venta`);
        }
      }
    });

    // Solo guarda los datos si la fecha cambió (es un nuevo día)
    if (fechaGuardada !== hoyISO) {
      localStorage.setItem("datosPrevios", JSON.stringify({
        fecha: hoyISO,
        valores: hoyData
      }));
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

  if (variacion === 0) {
    span.textContent = "= 0%";
    span.style.color = "#00BFFF"; 
  } else {
    span.textContent = `${variacion > 0 ? "▲" : "▼"} ${Math.abs(variacion)}%`;
    span.style.color = variacion > 0 ? "red" : "green";
  }

  span.style.display = "block";
  span.style.fontSize = "0.5em";
  el.appendChild(span);
}

function agregarMensajeSinDatos(id) {
  const el = document.getElementById(id);
  const span = document.createElement("span");
  span.textContent = "Sin datos previos";
  span.style.color = "gray";
  span.style.fontSize = "0.3em";
  span.style.display = "block";
  span.style.whiteSpace = "nowrap";
  span.style.overflow = "hidden";
  span.style.textOverflow = "ellipsis";
  el.appendChild(span);
}

// Ejecuta la función al cargar y cada 30 minutos
cargarDolares();
setInterval(cargarDolares, 1800000);
