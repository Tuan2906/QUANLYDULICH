import { Spinner } from "react-bootstrap";

const MySpinner = ({animation="grow"}) => {
    return <Spinner style={{color:"#512da8"}} animation={animation} />;
}

export default MySpinner;