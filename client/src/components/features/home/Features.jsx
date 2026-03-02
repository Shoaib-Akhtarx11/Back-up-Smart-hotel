import SearchImg from "../../../assets/SearchDesktop.svg"
import CompareImg from "../../../assets/CompareDesktop.svg"
import SaveImg from "../../../assets/SaveDesktop.svg"


const Features = () => {
    return (
        <div>
            <div className="d-flex flex-column flex-md-row justify-content-between mt-3 gap-3 features-container">
                <div className="text-center flex-grow-1">
                    <img src={SearchImg} alt="Search" className="img-fluid" style={{ maxWidth: '100%', height: 'auto' }} />
                    <h3 className="text-center mt-3">Search Simply</h3>
                    <p className="text-center">Easily search through millions of</p>
                    <p className="text-center">hotels in seconds</p>
                </div>
                <div className="text-center flex-grow-1">
                    <img src={CompareImg} alt="Compare" className="img-fluid" style={{ maxHeight: '60%', width: 'auto' }} />
                    <h3 className="text-center mt-3">Compare Confidently</h3>
                    <p className="text-center">Compare hotels from over</p>
                    <p className="text-center">100+ sites</p>
                </div>
                <div className="text-center flex-grow-1">
                    <img src={SaveImg} alt="Save" className="img-fluid" style={{ maxWidth: '100%', height: 'auto' }} />
                    <h3 className="text-center mt-3">Save Big</h3>
                    <p className="text-center">Discover a great deal to book on</p>
                    <p className="text-center">our partner sites</p>
                </div>

            </div>
        </div>
    )
}

export default Features
