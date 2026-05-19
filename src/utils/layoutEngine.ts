import { PlateConfig, PlateData } from '../types';

export function generateLayout(plateConfig: PlateConfig, plateData: PlateData) {
  const { width, height, lineThickness, layout } = plateConfig;
  
  const innerWidth = width - lineThickness * 2;
  const innerHeight = height - lineThickness * 2;
  
  const startY = innerHeight / 2;
  const startX = -innerWidth / 2;

  const lines: { x: number, y: number, w: number, h: number }[] = [];
  const texts: { text: string, label?: string, x: number, y: number, w: number, h: number, rotate?: number }[] = [];

  const addHLine = (y: number, x: number = 0, w: number = innerWidth) => {
    lines.push({ x, y, w, h: lineThickness });
  };

  const addVLine = (x: number, y: number, h: number) => {
    lines.push({ x, y, w: lineThickness, h });
  };

  if (layout === 'standard') {
    let currentY = startY;

    if (plateData.title) {
      texts.push({ text: plateData.title, x: 0, y: currentY - 6, w: innerWidth, h: 12 });
      currentY -= 12;
      addHLine(currentY);
    }

    if (plateData.subtitle) {
      texts.push({ text: plateData.subtitle, x: 0, y: currentY - 4, w: innerWidth, h: 8 });
      currentY -= 8;
      addHLine(currentY);
    }

    const bottomY = plateData.footer ? -innerHeight / 2 + 10 : -innerHeight / 2;
    const availableHeight = currentY - bottomY;

    const rows: any[] = [];
    if (plateData.animalName) rows.push({ type: 'full', label: 'NOME DA AVE', text: plateData.animalName });
    if (plateData.ringNumber || plateData.sex) rows.push({ type: 'half', l1: 'ANILHA', t1: plateData.ringNumber, l2: 'SEXO', t2: plateData.sex });
    if (plateData.birthDate || plateData.ctf) rows.push({ type: 'half', l1: 'DATA DE NASC.', t1: plateData.birthDate, l2: 'REGISTRO CTF', t2: plateData.ctf });
    if (plateData.owner) rows.push({ type: 'full', label: plateData.ownerLabel || 'PROPRIETÁRIO', text: plateData.owner });

    const numRows = Math.max(1, rows.length);
    const rowHeight = availableHeight / numRows;

    rows.forEach((row, index) => {
      if (row.type === 'full') {
        texts.push({ label: row.label, text: row.text, x: 0, y: currentY - rowHeight / 2, w: innerWidth, h: rowHeight });
      } else if (row.type === 'half') {
        if (row.t1) texts.push({ label: row.l1, text: row.t1, x: -innerWidth / 4, y: currentY - rowHeight / 2, w: innerWidth / 2, h: rowHeight });
        if (row.t2) texts.push({ label: row.l2, text: row.t2, x: innerWidth / 4, y: currentY - rowHeight / 2, w: innerWidth / 2, h: rowHeight });
        if (row.t1 || row.t2) addVLine(0, currentY - rowHeight / 2, rowHeight);
      }
      currentY -= rowHeight;
      if (index < rows.length - 1) {
        addHLine(currentY);
      }
    });

    if (plateData.footer) {
      addHLine(currentY);
      texts.push({ text: plateData.footer, x: 0, y: currentY - 5, w: innerWidth, h: 10 });
    }

  } else if (layout === 'technical') {
    let currentY = startY;
    
    if (plateData.title) {
      texts.push({ text: plateData.title, x: 0, y: currentY - 7, w: innerWidth, h: 14 });
      currentY -= 14;
      addHLine(currentY);
    }
    
    const footerH = plateData.footer ? 10 : 0;
    const dataH = (currentY + innerHeight / 2) - footerH;
    const rowH = dataH / 3;
    
    // Row 1: Name
    texts.push({ label: 'ESPÉCIE / NOME', text: plateData.animalName, x: 0, y: currentY - rowH / 2, w: innerWidth, h: rowH });
    currentY -= rowH;
    addHLine(currentY);
    
    // Row 2: Ring | CTF | Sex
    const col1W = innerWidth * 0.33;
    const col2W = innerWidth * 0.34;
    const col3W = innerWidth * 0.33;
    texts.push({ label: 'ANILHA', text: plateData.ringNumber, x: -innerWidth/2 + col1W/2, y: currentY - rowH/2, w: col1W, h: rowH });
    texts.push({ label: 'CTF', text: plateData.ctf, x: -innerWidth/2 + col1W + col2W/2, y: currentY - rowH/2, w: col2W, h: rowH });
    texts.push({ label: 'SEXO', text: plateData.sex, x: innerWidth/2 - col3W/2, y: currentY - rowH/2, w: col3W, h: rowH });
    
    addVLine(-innerWidth/2 + col1W, currentY - rowH/2, rowH);
    addVLine(-innerWidth/2 + col1W + col2W, currentY - rowH/2, rowH);
    currentY -= rowH;
    addHLine(currentY);
    
    // Row 3: Birth | Owner
    const bW = innerWidth * 0.4;
    const oW = innerWidth * 0.6;
    texts.push({ label: 'NASCIMENTO', text: plateData.birthDate, x: -innerWidth/2 + bW/2, y: currentY - rowH/2, w: bW, h: rowH });
    texts.push({ label: plateData.ownerLabel || 'CRIADOR / PROPRIETÁRIO', text: plateData.owner, x: innerWidth/2 - oW/2, y: currentY - rowH/2, w: oW, h: rowH });
    addVLine(-innerWidth/2 + bW, currentY - rowH/2, rowH);
    currentY -= rowH;
    
    if (plateData.footer) {
      addHLine(currentY);
      texts.push({ text: plateData.footer, x: 0, y: currentY - footerH/2, w: innerWidth, h: footerH });
    }

  } else if (layout === 'sidebar') {
    const sidebarW = innerWidth * 0.15;
    const dataW = innerWidth - sidebarW;
    
    if (plateData.title) {
      addVLine(-innerWidth/2 + sidebarW, 0, innerHeight);
      texts.push({ text: plateData.title, x: -innerWidth/2 + sidebarW/2, y: 0, w: innerHeight, h: sidebarW, rotate: Math.PI/2 });
    }
    
    let currentY = startY;
    const bottomY = plateData.footer ? -innerHeight / 2 + 10 : -innerHeight / 2;
    const availableHeight = currentY - bottomY;
    
    const rows: any[] = [];
    if (plateData.animalName) rows.push({ label: 'AVE', text: plateData.animalName });
    if (plateData.ringNumber) rows.push({ label: 'ANILHA', text: plateData.ringNumber });
    if (plateData.ctf) rows.push({ label: 'CTF', text: plateData.ctf });
    if (plateData.birthDate || plateData.sex) {
      const text = [plateData.birthDate, plateData.sex].filter(Boolean).join(' - ');
      rows.push({ label: 'NASCIMENTO / SEXO', text });
    }
    if (plateData.owner) rows.push({ label: plateData.ownerLabel || 'PROPRIETÁRIO', text: plateData.owner });

    const numRows = Math.max(1, rows.length);
    const rowH = availableHeight / numRows;
    const dataX = plateData.title ? -innerWidth/2 + sidebarW + dataW/2 : 0;
    const lineX = plateData.title ? -innerWidth/2 + sidebarW + dataW/2 : 0;
    const actualDataW = plateData.title ? dataW : innerWidth;
    
    rows.forEach((row, index) => {
      texts.push({ label: row.label, text: row.text, x: dataX, y: currentY - rowH/2, w: actualDataW, h: rowH });
      currentY -= rowH;
      if (index < rows.length - 1) {
        addHLine(currentY, lineX, actualDataW);
      }
    });

    if (plateData.footer) {
      addHLine(currentY, lineX, actualDataW);
      texts.push({ text: plateData.footer, x: dataX, y: currentY - 5, w: actualDataW, h: 10 });
    }

  } else if (layout === 'badge') {
    let currentY = startY;
    const titleH = 16;
    if (plateData.title) {
      texts.push({ text: plateData.title, x: 0, y: currentY - titleH/2, w: innerWidth, h: titleH });
      currentY -= titleH;
      addHLine(currentY);
    }
    
    const bottomY = plateData.footer ? -innerHeight / 2 + 10 : -innerHeight / 2;
    const availableHeight = currentY - bottomY;

    const rows: any[] = [];
    if (plateData.animalName) rows.push({ label: 'ESPÉCIE', text: plateData.animalName });
    if (plateData.ringNumber) rows.push({ label: 'ANILHA', text: plateData.ringNumber });
    if (plateData.ctf) rows.push({ label: 'CTF', text: plateData.ctf });
    if (plateData.sex || plateData.birthDate) {
      const text = [plateData.sex, plateData.birthDate].filter(Boolean).join(' | ');
      rows.push({ label: 'SEXO / NASC.', text });
    }
    if (plateData.owner) rows.push({ label: plateData.ownerLabel || 'CRIADOR', text: plateData.owner });

    const numRows = Math.max(1, rows.length);
    const rowH = availableHeight / numRows;

    rows.forEach((row, index) => {
      texts.push({ label: row.label, text: row.text, x: 0, y: currentY - rowH/2, w: innerWidth, h: rowH });
      currentY -= rowH;
      if (index < rows.length - 1) {
        addHLine(currentY);
      }
    });

    if (plateData.footer) {
      addHLine(currentY);
      texts.push({ text: plateData.footer, x: 0, y: currentY - 5, w: innerWidth, h: 10 });
    }

  } else if (layout === 'simple') {
    let currentY = startY;

    if (plateData.title) {
      texts.push({ text: plateData.title, x: 0, y: currentY - 6, w: innerWidth, h: 12 });
      currentY -= 12;
      addHLine(currentY);
    }

    const bottomY = plateData.footer ? -innerHeight / 2 + 10 : -innerHeight / 2;
    const availableHeight = currentY - bottomY;

    const rows: any[] = [];
    if (plateData.animalName) rows.push({ label: 'AVE', text: plateData.animalName });
    if (plateData.ringNumber) rows.push({ label: 'ANILHA', text: plateData.ringNumber });
    if (plateData.owner) rows.push({ label: plateData.ownerLabel || 'PROPRIETÁRIO', text: plateData.owner });

    const numRows = Math.max(1, rows.length);
    const rowH = availableHeight / numRows;

    rows.forEach((row, index) => {
      texts.push({ label: row.label, text: row.text, x: 0, y: currentY - rowH/2, w: innerWidth, h: rowH });
      currentY -= rowH;
      if (index < rows.length - 1) {
        addHLine(currentY);
      }
    });

    if (plateData.footer) {
      addHLine(currentY);
      texts.push({ text: plateData.footer, x: 0, y: currentY - 5, w: innerWidth, h: 10 });
    }

  } else if (layout === 'split') {
    let currentY = startY;

    if (plateData.title) {
      texts.push({ text: plateData.title, x: 0, y: currentY - 6, w: innerWidth, h: 12 });
      currentY -= 12;
      addHLine(currentY);
    }

    const bottomY = plateData.footer ? -innerHeight / 2 + 10 : -innerHeight / 2;
    const availableHeight = currentY - bottomY;

    addVLine(0, currentY - availableHeight / 2, availableHeight);

    const leftRows: any[] = [];
    if (plateData.animalName) leftRows.push({ label: 'AVE', text: plateData.animalName });
    if (plateData.owner) leftRows.push({ label: plateData.ownerLabel || 'PROPRIETÁRIO', text: plateData.owner });

    const rightRows: any[] = [];
    if (plateData.ringNumber) rightRows.push({ label: 'ANILHA', text: plateData.ringNumber });
    if (plateData.sex) rightRows.push({ label: 'SEXO', text: plateData.sex });
    if (plateData.birthDate) rightRows.push({ label: 'NASCIMENTO', text: plateData.birthDate });
    if (plateData.ctf) rightRows.push({ label: 'CTF', text: plateData.ctf });

    const leftNumRows = Math.max(1, leftRows.length);
    const leftRowH = availableHeight / leftNumRows;
    let leftY = currentY;
    leftRows.forEach((row, index) => {
      texts.push({ label: row.label, text: row.text, x: -innerWidth/4, y: leftY - leftRowH/2, w: innerWidth/2, h: leftRowH });
      leftY -= leftRowH;
      if (index < leftRows.length - 1) addHLine(leftY, -innerWidth/4, innerWidth/2);
    });

    const rightNumRows = Math.max(1, rightRows.length);
    const rightRowH = availableHeight / rightNumRows;
    let rightY = currentY;
    rightRows.forEach((row, index) => {
      texts.push({ label: row.label, text: row.text, x: innerWidth/4, y: rightY - rightRowH/2, w: innerWidth/2, h: rightRowH });
      rightY -= rightRowH;
      if (index < rightRows.length - 1) addHLine(rightY, innerWidth/4, innerWidth/2);
    });

    currentY -= availableHeight;

    if (plateData.footer) {
      addHLine(currentY);
      texts.push({ text: plateData.footer, x: 0, y: currentY - 5, w: innerWidth, h: 10 });
    }

  } else if (layout === 'minimalist') {
    let currentY = startY;

    if (plateData.title) {
      texts.push({ text: plateData.title, x: 0, y: currentY - 6, w: innerWidth, h: 12 });
      currentY -= 12;
    }

    const bottomY = plateData.footer ? -innerHeight / 2 + 10 : -innerHeight / 2;
    const availableHeight = currentY - bottomY;

    const rows: any[] = [];
    if (plateData.animalName) rows.push({ label: 'AVE', text: plateData.animalName });
    if (plateData.ringNumber) rows.push({ label: 'ANILHA', text: plateData.ringNumber });
    if (plateData.sex || plateData.birthDate) {
      const text = [plateData.sex, plateData.birthDate].filter(Boolean).join(' | ');
      rows.push({ label: 'SEXO / NASCIMENTO', text });
    }
    if (plateData.ctf) rows.push({ label: 'CTF', text: plateData.ctf });
    if (plateData.owner) rows.push({ label: plateData.ownerLabel || 'PROPRIETÁRIO', text: plateData.owner });

    const numRows = Math.max(1, rows.length);
    const rowH = availableHeight / numRows;

    rows.forEach((row) => {
      texts.push({ label: row.label, text: row.text, x: 0, y: currentY - rowH/2, w: innerWidth, h: rowH });
      currentY -= rowH;
    });

    if (plateData.footer) {
      texts.push({ text: plateData.footer, x: 0, y: currentY - 5, w: innerWidth, h: 10 });
    }
  }

  return { lines, texts };
}
