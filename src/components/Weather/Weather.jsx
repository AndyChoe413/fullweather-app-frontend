import React, { Component } from 'react'
import axios from 'axios'
import "./Weather.css"

// - Example of API call:
// api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=78f97703e8abd2a20ae1f43d86cbdb6b 

const API_key = process.env.REACT_APP_APIKEY
console.log(process.env)
export class Weather extends Component {

    state = {
        resultCity: '',
        resultCountry: '',
        weatherLocations: [],
        city: '',
        country: '',
        temperature: '',
        description: '',
        error: null,
        errorMessage: '',
    }


    async componentDidMount() {
        try {
            let getAllData = await axios.get("http://localhost:3001/api/weather/get-all-searched-locations")
            console.log(getAllData)

            this.setState({
                weatherLocations: getAllData.data.payload
            })

        } catch (e) {
            console.log(e)
        }
    }

    handleChange = event => {
        // console.log(event.target)
        this.setState({
            [event.target.name]: event.target.value,
            error: null,
            errorMessage: "",
        })
    }

    handleOnSubmit = async (event) => {
        event.preventDefault()
        console.log('submit pressed')
        if (this.state.city.length === 0 && this.state.country.length === 0) {
            this.setState({
                error: true,
                errorMessage: "Please fill out the form before submitting"
            })
        } else {
            try {

                let city = this.state.city;
                let country = this.state.country;
                console.log(this.state)

                const api_call = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&APPID=${API_key}&units=imperial`)
                
                this.setState({
                    resultCity: api_call.data.name,
                    resultCountry: api_call.data.sys.country,
                    temperature: api_call.data.main.temp,
                    description: api_call.data.weather[0].description,
                })

                const getAllLocations = await axios.post("http://localhost:3001/api/weather/add-location", {
                    city: api_call.data.name,
                    country: api_call.data.sys.country,
                })

                //this uploads to DOM after submit is pressed
                this.setState({
                    weatherLocations: [...this.state.weatherLocations,
                        getAllLocations.data.payload
                    ]
                })

                console.log(getAllLocations)
                console.log(api_call)
            } catch (e) {
                console.log(e.response)
                this.setState({
                    error: true,
                    errorMessage: "City or Country not found, please check spelling"
                })
            }
               
        }
    }

    deleteById = async(_id) => {
        try {
            const deleteLocation = await axios.delete(`http://localhost:3001/api/weather/delete-location-by-id/${_id}`)
            console.log(deleteLocation)
            
            let newArray = this.state.weatherLocations.filter((item) => {
                return item._id !== _id;
            })

            this.setState({
                weatherLocations: newArray
            })

        } catch (e) {
            console.log(e.response)
        }   
    }

    render() {
        return (
            <div >
            <div style={{textAlign:"center", margin:"50%"}} className="container">
                <form  onSubmit={this.handleOnSubmit}>
                <div style={{textAlign:"center"}} className="row">
                    <div className="top-column">
                        <input onChange={this.handleChange} type="text" className="form" name="city" autoComplete="off" placeholder="City"/>
                    </div>
                    <div className="top-column">
                        <input onChange={this.handleChange} type="text" className="form" name="country" autoComplete="off" placeholder="Country"/>
                    </div>
                    <div className="top-column">
                        <button  className="btn btn-warning">Get Weather</button>
                    </div>
                </div>
                    </form>
                    <br></br>
                    <div className="description-ctn">{this.state.resultCity} {this.state.resultCountry}</div>
                    <div className="description-ctn">{this.state.temperature}</div>
                    <div className="description-ctn"> {this.state.description}</div>

                    <div className="error-message">{this.state.errorMessage}</div>
                    <h3>Searched locations</h3>
                    <div className="results">{this.state.weatherLocations.map((results) => {
                        console.log(results)
                        return (
                            <div key={results._id}>
                                
                                <br></br>
                                <span >{results.city} {results.country}</span>
                                <button onClick={() => this.deleteById(results._id)} className="delete">Delete</button>
                            </div>                                                  
                        )
                    })}
                    </div>
            </div>
            </div>
        )
    }
}

export default Weather
