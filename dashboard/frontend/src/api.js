import axios from "axios";

export default function API() {

    const getOverview = async (query, analyse) => {
        let json = await axios.get("./overview?query=" + encodeURIComponent(query) + "&portion=" + (analyse === "portion"));

        // TODO add error handling

        return json.data
    }

    return {
        getOverview
    }
}
