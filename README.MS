# Delaware River Dashboard

A live monitoring dashboard for river conditions, weather forecasts, and fishing reports for the Delaware River and its tributaries.

## Features

- **Real-time River Data**: Water levels, flow rates, and temperature from USGS monitoring stations
- **Interactive Map**: Visual display of all monitoring stations with status indicators
- **Weather Forecasts**: Current conditions and 5-day forecasts for the region
- **Fishing Reports**: Latest fishing conditions and recommended flies
- **Alerts & Notifications**: Dam releases, flood warnings, and other important alerts
- **Historical Charts**: 7-day trends for water levels and flow rates
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Data Sources

- USGS Water Data Service for river conditions
- National Weather Service API for weather forecasts
- Delaware River Basin Commission for release schedules
- Various fishing report websites

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Data Visualization**: Recharts
- **Data Fetching**: SWR (stale-while-revalidate)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/delaware-river-dashboard.git
cd delaware-river-dashboard
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is designed to be deployed on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Deploy!

## Project Structure

```
delaware-river-dashboard/
├── components/         # React components
│   ├── RiverStationCard.js
│   ├── WeatherForecast.js
│   ├── FishingReports.js
│   ├── RiverAlerts.js
│   └── RiverMap.js
├── pages/              # Next.js pages
│   ├── index.js        # Main dashboard page
│   ├── _app.js         # Next.js application wrapper
│   ├── api/            # API routes
│   │   ├── stations.js
│   │   ├── station/[id].js
│   │   ├── weather/[lat]/[lng].js
│   │   ├── fishing-reports.js
│   │   └── alerts.js
├── styles/             # CSS files
│   └── globals.css
├── public/             # Static assets
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- USGS Water Data Service for providing river data
- National Weather Service for weather forecast API
- All the anglers who share their fishing reports
