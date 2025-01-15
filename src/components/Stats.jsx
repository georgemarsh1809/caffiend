import { useAuth } from "../context/AuthContext"
import { calculateCoffeeStats, calculateCurrentCaffeineLevel, coffeeConsumptionHistory, coffeeOptions, getTopThreeCoffees, statusLevels } from "../utils"

function StatCard(props) {
    // Internally scoped component - only accessible from within this file. 
    // Useful for reused components when '.map' isn't appropriate

    const { lg, title, children } = props

    return (
        <div className={"card stat-card " + (lg ? 'col-span-2' : '')}>
            <h4>{title}</h4>
            {children}
        </div>
    )
}

export default function Stats() {
    const { globalData } = useAuth()
    const stats = calculateCoffeeStats(globalData)

    const caffeineLevel = calculateCurrentCaffeineLevel(globalData)

    const warningLevel = caffeineLevel < statusLevels['low'].maxLevel ?
        'low' :
        caffeineLevel < statusLevels['moderate'] ?
            'moderate' :
            'high'

    return (
        <>
            <div className="section-header">
                <i className="fa-solid fa-chart-simple" />
                <h2>My Stats</h2>
            </div>
            <div className="stats-grid">
                <StatCard lg title='Active Caffeine Level'>
                    <div className="status">
                        <p><span className="stat-text">{caffeineLevel}</span>mg</p>
                        <h5 style={{ color: statusLevels[warningLevel].color, backgroundColor: statusLevels[warningLevel].background }}>{warningLevel}</h5>
                    </div>
                    <p>{statusLevels[warningLevel].description}</p>
                </StatCard>
                <StatCard title='Daily Caffeine'>
                    <p><span className="stat-text">{stats.daily_caffeine}</span>mg</p>
                </StatCard>
                <StatCard title='Average Number of Coffees'>
                    <p><span className="stat-text">{stats.average_coffees}</span>/day</p>
                </StatCard>
                <StatCard title='Daily Cost ($)'>
                    <p>$<span className="stat-text">{stats.daily_cost}</span></p>
                </StatCard>
                <StatCard title='Total Cost ($)'>
                    <p>$<span className="stat-text">{stats.total_cost}</span></p>
                </StatCard>

                <table className="stat-table">
                    <thead>
                        <tr>
                            <th>Coffee Name</th>
                            <th>Number of Purchases</th>
                            <th>Percentage of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getTopThreeCoffees(globalData).map((coffee, coffeeIndex) => {
                            return (
                                <tr key={coffeeIndex}>
                                    <td>{coffee.coffeeName}</td>
                                    <td>{coffee.count}</td>
                                    <td>{coffee.percentage}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}