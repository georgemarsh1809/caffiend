import { useState } from 'react'
import { coffeeOptions } from '../utils'
import Modal from './Modal'
import Authentication from './Authentication'
import { useAuth } from '../context/AuthContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'

export default function CoffeeForm(props) {
    const { isAuthenticated } = props
    const [showModal, setShowModal] = useState(false)
    const [selectedCoffee, setSelectedCoffee] = useState(null)
    const [showCoffeeTypes, setShowCoffeeTypes] = useState(false)
    const [coffeeCost, setCoffeeCost] = useState(0)
    const [hour, setHour] = useState(0)
    const [min, setMin] = useState(0)

    const { globalData, globalUser, setGlobalData } = useAuth()

    async function handleSubmitForm() {
        if (!isAuthenticated) {
            setShowModal(true)
            return
        }

        // Define guard clause that only submits form if its completed
        if (!selectedCoffee) {
            return
        }

        try {
            // If true, then create new data object
            const newGlobalData = {
                ...(globalData || {})
            }

            const nowTime = Date.now()
            const timeToSubtract = (hour * 60 * 60 * 1000) + (min * 60 * 1000)
            const timestamp = nowTime - timeToSubtract

            const newData = {
                name: selectedCoffee,
                cost: coffeeCost
            }

            newGlobalData[timestamp] = newData

            console.log(timestamp, selectedCoffee, coffeeCost)

            // Update global state 
            setGlobalData(newGlobalData)

            // Persist in FB
            const userRef = doc(db, 'users', globalUser.uid)
            const res = await setDoc(userRef, {
                [timestamp]: newData
            }, { merge: true })

            // Reset form
            setSelectedCoffee(null)
            setHour(0)
            setMin(0)
            setCoffeeCost(0)

        } catch (err) {
            console.log(err.message)

        }
    }

    function handleCloseModal() {
        setShowModal(false)
    }

    return (
        <>
            {showModal && (
                <Modal handleCloseModal={handleCloseModal}>
                    <Authentication handleCloseModal={handleCloseModal} />
                </Modal>)}
            <div className="section-header">
                <i className="fa-solid fa-pen-to-square"></i>
                <h2>Start Tracking</h2>
            </div>
            <h4>Select Coffee Type</h4>
            <div className="coffee-grid">
                {coffeeOptions.slice(0, 5).map((option, optionIndex) => {
                    return (
                        <button onClick={() => {
                            setSelectedCoffee(option.name)
                            setShowCoffeeTypes(false)
                        }} className={'button-card ' + (option.name === selectedCoffee ? 'coffee-button-selected' : ' ')}
                            key={optionIndex}>
                            <h4>{option.name}</h4>
                            <p>{option.caffeine}mg</p>
                        </button>
                    )
                })}
                <button onClick={() => {
                    setShowCoffeeTypes(true)
                    setSelectedCoffee(null)
                }} className={'button-card ' + (showCoffeeTypes ? 'coffee-button-selected' : ' ')}>
                    <h4>Other</h4>
                </button>
            </div>
            {showCoffeeTypes && ( // If the user wants to show more coffee types (if showCoffeeTypes is true, show options)
                <select onChange={(e) => {
                    setSelectedCoffee(e.target.value)
                }} id="coffee-list" name="coffee-list">
                    <option value={null}>Select type</option>
                    {coffeeOptions.map((option, optionIndex) => {
                        return (
                            <option value={option.value} key={optionIndex}>
                                {option.name} ({option.caffeine}mg)
                            </option>
                        )
                    })}
                </select>)}
            <h4>Add Cost ($)</h4>
            <input className='w-full' type='number' value={coffeeCost} onChange={(e) => {
                setCoffeeCost(e.target.value)
            }} placeholder='e.g. $4.50' />
            <h4>Time Since Consumption</h4>
            <div className='time-entry'>
                <div>
                    <h6>Hours</h6>
                    <select onChange={(e) => {
                        setHour(e.target.value)
                    }} id="hours-select">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
                            15, 16, 17, 18, 29, 20, 21, 22, 23].map((hours, hoursIndex) => {
                                return (
                                    <option key={hoursIndex} value={hours}>{hours}</option>
                                )
                            })}
                    </select>

                </div>
                <div>
                    <h6>Mins</h6>
                    <select onChange={(e) => {
                        setMin(e.target.value)
                    }} id="mins-select">
                        {[0, 5, 10, 15, 30, 45].map((mins, minsIndex) => {
                            return (
                                <option key={minsIndex} value={mins}>{mins}</option>
                            )
                        })}
                    </select>
                </div>
            </div>
            <button onClick={() => {
                handleSubmitForm()
            }}>
                <p>Add Entry</p>
            </button>

        </>
    )
}