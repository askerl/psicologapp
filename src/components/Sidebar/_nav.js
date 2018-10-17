export default {
  items: [
    {
      name: 'Inicio',
      url: '/dashboard',
      icon: 'icon-home'
    },
    {
      name: 'Administración',
      url: '/admin',
      icon: 'icon-settings',
      children: [
        {
          name: 'Prepagas',
          url: '/admin/prepagas',
          icon: 'fa fa-hospital-o',
        },
        {
          name: 'Respaldos',
          url: '/admin/respaldos',
          icon: 'fa fa-database',
        },
      ]
    },
    {
      name: 'Pacientes',
      url: '/pacientes',
      icon: 'icon-people'
    },
    {
      name: 'Sesiones',
      url: '/sesiones',
      icon: 'icon-bubbles'
    },
    {
      name: 'Facturaciones',
      url: '/facturaciones',
      icon: 'icon-chart'
    }
  ]
};
