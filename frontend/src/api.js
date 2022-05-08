import axios from "axios";

export default function API() {

    const getOverview = async (url) => {
        let json = await axios.get("./overview");

        // TODO add error handling

        return json.data
    }

    return {
        getOverview
    }
}
