import React from 'react';
import { Button } from 'reactstrap';

// EXPORTAR A CSV
const ExportCSV = (props) => {
    const handleClick = () => {
      props.onExport();
    };
    return (
        <div>
            <Button color="info" size="sm" title="Exportar a CSV" onClick={handleClick}><i className="fa fa-file-excel-o mr-2"></i>Exportar a CSV</Button>                    
        </div>
    );
};

export default ExportCSV;
