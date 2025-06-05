import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface StatsData {
  servicesStats: any[];
  periodStats: any[];
  productsStats: any[];
  transactionStats: any[];
  documentTypeStats: any[];
}

export function StatsDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem('sessionId');
      
      if (!sessionId) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${sessionId}`
      };

      const [servicesRes, ordersRes, transactionsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/stats/services?annee=${selectedYear}${selectedMonth ? `&mois=${selectedMonth}` : ''}`, { headers }),
        fetch(`http://localhost:3000/api/stats/orders?annee=${selectedYear}${selectedMonth ? `&mois=${selectedMonth}` : ''}`, { headers }),
        fetch(`http://localhost:3000/api/stats/transactions?annee=${selectedYear}${selectedMonth ? `&mois=${selectedMonth}` : ''}`, { headers })
      ]);

      if (!servicesRes.ok || !ordersRes.ok || !transactionsRes.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const [servicesData, ordersData, transactionsData] = await Promise.all([
        servicesRes.json(),
        ordersRes.json(),
        transactionsRes.json()
      ]);

      setStatsData({
        servicesStats: servicesData.data.servicesStats,
        periodStats: servicesData.data.periodStats,
        productsStats: ordersData.data.productsStats,
        transactionStats: transactionsData.data.transactionStats,
        documentTypeStats: transactionsData.data.documentTypeStats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      toast.error('Erreur lors de la récupération des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedMonth]);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filtres */}
      <div className="flex gap-4 mb-8">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth || ''}
          onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
          className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        >
          <option value="">Tous les mois</option>
          {months.map((month, index) => (
            <option key={index + 1} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Services Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4">Services les plus demandés</h3>
          {statsData?.servicesStats && (
            <Line
              data={{
                labels: statsData.servicesStats.map(stat => stat.serviceName),
                datasets: [
                  {
                    label: 'Total des demandes',
                    data: statsData.servicesStats.map(stat => stat.totalDemandes),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                  },
                  {
                    label: 'Demandes validées',
                    data: statsData.servicesStats.map(stat => stat.demandesValidees),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                  }
                ]
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        label += context.parsed.y;
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4">Répartition des demandes</h3>
          {statsData?.periodStats && (
            <Line
              data={{
                labels: statsData.periodStats.map(stat => months[stat.mois - 1]),
                datasets: [
                  {
                    label: 'Demandes totales',
                    data: statsData.periodStats.map(stat => stat.totalDemandes),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.1,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                  },
                  {
                    label: 'Demandes validées',
                    data: statsData.periodStats.map(stat => stat.demandesValidees),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                  }
                ]
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        label += context.parsed.y;
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Orders Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4">Produits les plus commandés</h3>
          {statsData?.productsStats && (
            <Bar
              data={{
                labels: statsData.productsStats.map(stat => stat.productName),
                datasets: [
                  {
                    label: 'Quantité totale',
                    data: statsData.productsStats.map(stat => stat.totalQuantite),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    borderRadius: 5,
                    hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)'
                  }
                ]
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        label += context.parsed.y + ' unités';
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4">Volume des commandes</h3>
          {statsData?.periodStats && (
            <Bar
              data={{
                labels: statsData.periodStats.map(stat => months[stat.mois - 1]),
                datasets: [
                  {
                    label: 'Volume total',
                    data: statsData.periodStats.map(stat => stat.totalQuantite),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    borderRadius: 5,
                    hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)'
                  }
                ]
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        label += context.parsed.y + ' unités';
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Transactions Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4">Volume financier</h3>
          {statsData?.transactionStats && (
            <Line
              data={{
                labels: statsData.transactionStats.map(stat => months[stat.mois - 1]),
                datasets: [
                  {
                    label: 'Montant total',
                    data: statsData.transactionStats.map(stat => stat.montantTotal),
                    borderColor: 'rgb(245, 158, 11)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                  }
                ]
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        label += new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF'
                        }).format(context.parsed.y);
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                          maximumFractionDigits: 0
                        }).format(value as number);
                      }
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4">Répartition par type de document</h3>
          {statsData?.documentTypeStats && (
            <Pie
              data={{
                labels: statsData.documentTypeStats.map(stat => stat.type_document),
                datasets: [
                  {
                    data: statsData.documentTypeStats.map(stat => stat.montantTotal),
                    backgroundColor: [
                      'rgba(245, 158, 11, 0.7)',
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(34, 197, 94, 0.7)',
                    ],
                    borderColor: [
                      'rgb(245, 158, 11)',
                      'rgb(59, 130, 246)',
                      'rgb(34, 197, 94)',
                    ],
                    borderWidth: 1,
                    hoverOffset: 4
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF'
                        }).format(value)} (${percentage}%)`;
                      }
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 