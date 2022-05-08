import axios from "axios";

export default function CloudAPI() {

    const process = async (url) => {
        let json = await axios.get("./process?url="+url)

        // TODO add error handling

        return json.data
    }

    return {
        process
    }
}
