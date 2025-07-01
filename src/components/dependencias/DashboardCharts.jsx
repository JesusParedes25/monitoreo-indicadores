import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { COLORS } from '../../styles/colors';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler
);

const DashboardCharts = ({ tramites, secretarias, estadisticasGenerales }) => {
  // Preparar datos para gráficos
  const prepararDatosGraficos = () => {
    // Colores institucionales
    const coloresInstitucionales = [
      COLORS.primary,
      COLORS.primaryDark,
      COLORS.secondary,
      COLORS.accent,
      '#942241',
      '#691c32',
      '#ddc9a3',
      '#235b4e'
    ];
    
    // Versiones con transparencia para fondos
    const coloresFondo = coloresInstitucionales.map(color => {
      // Convertir a rgba con 0.6 de opacidad
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
      }
      return color;
    });
    // Datos para gráfico de distribución de trámites por secretaría
    const tramitesPorSecretaria = {};
    secretarias.forEach(secretaria => {
      tramitesPorSecretaria[secretaria.id] = tramites.filter(t => t.secretaria_id === secretaria.id).length;
    });

    const datosDistribucionSecretarias = {
      labels: secretarias.map(s => s.nombre.length > 15 ? s.nombre.substring(0, 15) + '...' : s.nombre),
      datasets: [
        {
          label: 'Trámites por Secretaría',
          data: secretarias.map(s => tramitesPorSecretaria[s.id] || 0),
          backgroundColor: coloresFondo,
          borderColor: coloresInstitucionales,
          borderWidth: 1,
        },
      ],
    };

    // Datos para gráfico de avance de trámites
    const camposEtapas = [
      'capacitacion_modulo1',
      'capacitacion_modulo2',
      'boceto_modelado',
      'capacitacion_modulo3',
      'bizagi_modelado',
      'vo_bo_bizagi',
      'acciones_reingenieria',
      'vo_bo_acciones_reingenieria',
      'boceto_acuerdo',
      'vo_bo_acuerdo',
      'publicado'
    ];
    
    const etiquetasEtapas = [
      'Capacitación 1',
      'Capacitación 2',
      'Boceto Modelado',
      'Capacitación 3',
      'Bizagi Modelado',
      'Vo.Bo. Bizagi',
      'Acciones Reingeniería',
      'Vo.Bo. Acciones',
      'Boceto Acuerdo',
      'Vo.Bo. Acuerdo',
      'Publicado'
    ];
    
    const distribucionEtapas = Array(11).fill(0);
    
    // Contar trámites en cada etapa
    tramites.forEach(tramite => {
      camposEtapas.forEach((campo, index) => {
        if (tramite[campo] === true) {
          distribucionEtapas[index]++;
        }
      });
    });

    const datosAvanceTramites = {
      labels: etiquetasEtapas,
      datasets: [
        {
          label: 'Trámites por Etapa',
          data: distribucionEtapas,
          backgroundColor: coloresFondo[0],
          borderColor: coloresInstitucionales[0],
          borderWidth: 1,
        },
      ],
    };
    
    // Datos para el gráfico de nivel de digitalización
    const nivelesDigitalizacion = [0, 1, 2, 3, 4];
    const conteoNiveles = Array(5).fill(0);
    
    tramites.forEach(tramite => {
      const nivel = Math.round(parseFloat(tramite.nivel_digitalizacion || 0));
      if (nivel >= 0 && nivel <= 4) {
        conteoNiveles[nivel]++;
      }
    });
    
    const datosNivelDigitalizacion = {
      labels: ['Nivel 0', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4'],
      datasets: [
        {
          label: 'Trámites por Nivel de Digitalización',
          data: conteoNiveles,
          backgroundColor: coloresFondo,
          borderColor: coloresInstitucionales,
          borderWidth: 1,
        },
      ],
    };
    
    // Datos para el gráfico de radar de avance general
    const datosRadarAvance = {
      labels: ['Trámites Registrados', 'Trámites Publicados', 'Nivel Digitalización', 'Secretarías Activas', 'Avance General'],
      datasets: [
        {
          label: 'Estado Actual',
          data: [
            tramites.length / 900 * 100, // Porcentaje de trámites registrados del total estatal
            tramites.filter(t => t.publicado === true).length / tramites.length * 100, // Porcentaje de publicados
            estadisticasGenerales?.nivelDigitalizacionPromedio / 4 * 100 || 0, // Porcentaje de nivel digitalización
            estadisticasGenerales?.secretariasActivas / 10 * 100 || 0, // Porcentaje de secretarías activas (asumiendo un total de 10)
            tramites.reduce((sum, t) => {
              let pasos = 0;
              if (t.capacitacion_modulo1) pasos++;
              if (t.capacitacion_modulo2) pasos++;
              if (t.boceto_modelado) pasos++;
              if (t.capacitacion_modulo3) pasos++;
              if (t.bizagi_modelado) pasos++;
              if (t.vo_bo_bizagi) pasos++;
              if (t.acciones_reingenieria) pasos++;
              if (t.vo_bo_acciones_reingenieria) pasos++;
              if (t.boceto_acuerdo) pasos++;
              if (t.vo_bo_acuerdo) pasos++;
              if (t.publicado) pasos++;
              return sum + (pasos / 11);
            }, 0) / tramites.length * 100 // Porcentaje promedio de avance
          ],
          backgroundColor: `${coloresFondo[0]}50`,
          borderColor: coloresInstitucionales[0],
          borderWidth: 2,
          pointBackgroundColor: coloresInstitucionales[0],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: coloresInstitucionales[0],
          fill: true
        }
      ],
    };

    return {
      datosDistribucionSecretarias,
      datosAvanceTramites,
      datosNivelDigitalizacion,
      datosRadarAvance
    };
  };

  const { datosDistribucionSecretarias, datosAvanceTramites, datosNivelDigitalizacion, datosRadarAvance } = prepararDatosGraficos();

  const opcionesPie = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Trámites por Secretaría',
        font: {
          size: 14,
          weight: 'bold'
        },
        color: COLORS.primaryDark
      },
    },
  };

  const opcionesBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Avance de Trámites por Etapa',
        font: {
          size: 14,
          weight: 'bold'
        },
        color: COLORS.primaryDark
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Trámites',
          color: COLORS.darkGray
        }
      },
      x: {
        title: {
          display: true,
          text: 'Etapas',
          color: COLORS.darkGray
        },
        ticks: {
          maxRotation: 90,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      }
    }
  };
  
  const opcionesDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Nivel de Digitalización',
        font: {
          size: 14,
          weight: 'bold'
        },
        color: COLORS.primaryDark
      },
    },
  };
  
  const opcionesRadar = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: COLORS.lightGray
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 10
          }
        },
        pointLabels: {
          font: {
            size: 11
          },
          color: COLORS.darkGray
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Avance General (%)',
        font: {
          size: 14,
          weight: 'bold'
        },
        color: COLORS.primaryDark
      },
    },
  };

  // Usar estilos en línea directos para mayor control
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Primera fila: 2 gráficos */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: '16px', 
        marginBottom: '16px'
      }}>
        {/* Primer gráfico */}
        <div style={{
          backgroundColor: COLORS.white,
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${COLORS.mediumGray}`,
          width: 'calc(50% - 8px)',
          height: '300px',
          flexGrow: 1,
          flexBasis: '400px',
          minWidth: '0'
        }}>
          <Radar data={datosRadarAvance} options={opcionesRadar} />
        </div>
        
        {/* Segundo gráfico */}
        <div style={{
          backgroundColor: COLORS.white,
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${COLORS.mediumGray}`,
          width: 'calc(50% - 8px)',
          height: '300px',
          flexGrow: 1,
          flexBasis: '400px',
          minWidth: '0'
        }}>
          <Doughnut data={datosNivelDigitalizacion} options={opcionesDoughnut} />
        </div>
      </div>
      
      {/* Segunda fila: 1 gráfico */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%' 
      }}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${COLORS.mediumGray}`,
          width: '75%',
          height: '300px',
          minWidth: '0'
        }}>
          <Bar data={datosAvanceTramites} options={opcionesBar} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
