
import { IonIcon } from '@ionic/react';
import { eyeOffOutline } from 'ionicons/icons';
import './NoData.scss';

const NoData = () => {
    return (
        <div className="no-data fullheight xc">
            <div className="vcs">
                <div><IonIcon icon={eyeOffOutline}></IonIcon></div>
                <div className='no-records'>Nema zapisa</div>
            </div>
        </div>
    )
}

export default NoData;