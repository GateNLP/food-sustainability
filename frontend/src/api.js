import axios from "axios";

export default function API() {

    const getOverview = async (query) => {
        let json = await axios.get("./overview?query="+encodeURIComponent(query));

        // TODO add error handling

        return json.data
    }

    return {
        getOverview
    }
}
