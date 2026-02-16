import React, { useRef, useState } from 'react';
import * as GC from '@mescius/spread-sheets';
import { SpreadSheets } from '@mescius/spread-sheets-react';
import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import { useKeyTips, KEY_TIP_COMMANDS, KeyTipOverlay } from './keytips';
import './App.css';

function App() {
  const spreadRef = useRef<any>(null);
  const [spreadInstance, setSpreadInstance] = useState<GC.Spread.Sheets.Workbook | null>(null);
  const { state: keyTipState } = useKeyTips(KEY_TIP_COMMANDS, spreadInstance);

  const initSpread = (spread: GC.Spread.Sheets.Workbook) => {
    setSpreadInstance(spread);
    const sheet = spread.getActiveSheet();
    
    // Set some initial data
    sheet.setValue(0, 0, "Meridian Take Home");
    sheet.setValue(1, 0, "The following placeholder data is for testing purposes.");
    
    // Style the welcome message
    const style = new GC.Spread.Sheets.Style();
    style.font = "bold 16pt Arial";
    style.foreColor = "#1a73e8";
    sheet.setStyle(0, 0, style);
    
    // Add some sample data
    sheet.setValue(3, 0, "Product");
    sheet.setValue(3, 1, "Price");
    sheet.setValue(3, 2, "Quantity");
    sheet.setValue(3, 3, "Total");
    
    sheet.setValue(4, 0, "Laptop");
    sheet.setValue(4, 1, 999.99);
    sheet.setValue(4, 2, 2);
    sheet.setFormula(4, 3, "=B6*C6");
    
    sheet.setValue(5, 0, "Mouse");
    sheet.setValue(5, 1, 29.99);
    sheet.setValue(5, 2, 5);
    sheet.setFormula(5, 3, "=B7*C7");
    
    sheet.setValue(6, 0, "Keyboard");
    sheet.setValue(6, 1, 79.99);
    sheet.setValue(6, 2, 3);
    sheet.setFormula(6, 3, "=B8*C8");
    
    // Add total formula
    sheet.setValue(8, 2, "Total:");
    sheet.setFormula(8, 3, "=SUM(D6:D8)");
    
    // Format the price columns
    const currencyFormatter = new GC.Spread.Formatter.GeneralFormatter("$#,##0.00");
    sheet.getRange(5, 1, 3, 1).formatter(currencyFormatter);
    sheet.getRange(5, 3, 5, 1).formatter(currencyFormatter);
    
    // Auto fit columns
    sheet.autoFitColumn(0);
    sheet.autoFitColumn(1);
    sheet.autoFitColumn(2);
    sheet.autoFitColumn(3);
  };

  return (
    <div className="App" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ 
        margin: 0, 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #ddd' 
      }}>
        Meridian Take Home
      </h2>
      <div style={{ flex: 1, position: 'relative' }}>
        <KeyTipOverlay state={keyTipState} />
        <SpreadSheets
          ref={spreadRef}
          workbookInitialized={initSpread}
          hostStyle={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>
    </div>
  );
}

export default App;