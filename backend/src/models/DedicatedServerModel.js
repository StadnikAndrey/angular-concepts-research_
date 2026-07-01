import dedicatedList from '../assets/data-files/dedicated/dedicated-generated.json' with { type: 'json' };
import containers from '../assets/data-files/dedicated/containers.json' with { type: 'json' };
import operatingSystems from '../assets/data-files/dedicated/oses.json' with { type: 'json' };
import soft from '../assets/data-files/dedicated/dedicated_soft-generated.json' with { type: 'json' };

export default class DedicatedServerModel {

    static getRawDataDedicatedServer() {
        // to test the application's error handling system
        // throw new Error('backend error in src/models/DedicatedServerModel.js');

        return {
            dedicatedList,
            containers,
            operatingSystems,
            soft
        }
    }
}