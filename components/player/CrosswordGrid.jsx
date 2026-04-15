'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

export default function CrosswordGrid({ 
  questions, 
  onUpdate, 
  checkRequested = false, 
  hintRequested = null,
  clearRequested = false,
  onGridReady,
  onFocusQuestion,
  focusQuestionId
}) {
  const rows = 12
  const cols = 15
  
  const [grid, setGrid] = useState([])
  const [activeCell, setActiveCell] = useState({ r: 0, c: 0 })
  const [activeDirection, setActiveDirection] = useState('across')
  const [checkResults, setCheckResults] = useState(false)
  const inputRefs = useRef({})
  const activeCellRef = useRef({ r: 0, c: 0 })
  const activeDirectionRef = useRef('across')

  useEffect(() => {
    activeCellRef.current = activeCell
  }, [activeCell])

  useEffect(() => {
    activeDirectionRef.current = activeDirection
  }, [activeDirection])

  // Initialize grid
  useEffect(() => {
    const g = Array.from({ length: rows }, () => Array(cols).fill(null))
    
    questions.forEach(q => {
      const r = q.gridRow - 1
      const c = q.gridCol - 1
      const isAcross = q.gridDir === 'across'
      const len = q.gridLen || 0
      
      for (let i = 0; i < len; i++) {
        const currR = isAcross ? r : r + i
        const currC = isAcross ? c + i : c
        if (currR < rows && currC < cols) {
          if (!g[currR][currC]) {
            g[currR][currC] = {
              char: '',
              num: (i === 0) ? q.gridNum : null,
              isBlack: false,
              id: `${currR}-${currC}`,
              answer: '', // Store answer per cell
              questions: [q.questionId]
            }
          } else {
            if (i === 0) g[currR][currC].num = q.gridNum
            g[currR][currC].questions.push(q.questionId)
          }
          // Set correct char for validation/hints
          const correctChar = (q.answer || '')[i]?.toUpperCase() || ''
          g[currR][currC].answer = correctChar
        }
      }
    })
    
    // Correct loop
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!g[r][c]) g[r][c] = { isBlack: true }
      }
    }
    setGrid(g)
    if (onGridReady) onGridReady(g)
  }, [questions])

  // Handle Parent-triggered focus (Jump buttons)
  useEffect(() => {
    if (focusQuestionId) {
      const q = questions.find(q => q.questionId === focusQuestionId)
      if (q) {
        const r = q.gridRow - 1
        const c = q.gridCol - 1
        inputRefs.current[`${r}-${c}`]?.focus()
        setActiveCell({ r, c })
        setActiveDirection(q.gridDir)
      }
    }
  }, [focusQuestionId, questions])

  // Handle Clear
  useEffect(() => {
    if (clearRequested && grid.length > 0) {
      const newGrid = grid.map(row => row.map(cell => cell.isBlack ? cell : { ...cell, char: '' }))
      setGrid(newGrid)
      setCheckResults(false)
    }
  }, [clearRequested])

  // Handle Hint - targeted to active question
  useEffect(() => {
    if (hintRequested && grid.length > 0) {
      // Find the active question ID using refs to avoid stale closures
      const r = activeCellRef.current.r
      const c = activeCellRef.current.c
      const activeCellData = grid[r][c]
      if (!activeCellData || !activeCellData.questions) return

      // Find the question matching current direction
      const activeQId = questions.find(q => 
        activeCellData.questions.includes(q.questionId) && 
        q.gridDir === activeDirectionRef.current
      )?.questionId || activeCellData.questions[0]

      // Find empty/wrong cells for THIS question only
      const candidates = []
      grid.forEach((row, r) => row.forEach((cell, c) => {
        if (!cell.isBlack && cell.questions && cell.questions.includes(activeQId)) {
          if (cell.char !== cell.answer) {
             candidates.push({ r, c })
          }
        }
      }))
      
      if (candidates.length > 0) {
        const random = candidates[Math.floor(Math.random() * candidates.length)]
        const newGrid = [...grid]
        newGrid[random.r][random.c].char = newGrid[random.r][random.c].answer
        setGrid(newGrid)
        triggerUpdate(newGrid)
      }
    }
  }, [hintRequested])

  // Handle Check
  useEffect(() => {
    if (checkRequested) {
      setCheckResults(true)
    } else {
      setCheckResults(false)
    }
  }, [checkRequested])

  const triggerUpdate = (currentGrid) => {
    const answers = questions.map(q => {
      const startR = q.gridRow - 1
      const startC = q.gridCol - 1
      const isAcross = q.gridDir === 'across'
      let word = ''
      for (let i = 0; i < q.gridLen; i++) {
        word += currentGrid[isAcross ? startR : startR + i][isAcross ? startC + i : startC]?.char || ''
      }
      return { questionId: q.questionId, inputText: word }
    })
    onUpdate(answers)
  }

  const handleCharInput = (r, c, char) => {
    if (!/^[a-zA-Z]?$/.test(char)) return
    
    const newGrid = [...grid]
    newGrid[r][c].char = char.toUpperCase()
    setGrid(newGrid)
    setCheckResults(false) // Reset check status when user edits
    
    triggerUpdate(newGrid)

    if (char) {
      moveToNext(r, c)
    }
  }

  const moveToNext = (r, c) => {
    let nextR = r, nextC = c
    if (activeDirection === 'across') {
      nextC++
    } else {
      nextR++
    }

    if (nextR < rows && nextC < cols && !grid[nextR][nextC]?.isBlack) {
      inputRefs.current[`${nextR}-${nextC}`]?.focus()
      setActiveCell({ r: nextR, c: nextC })
    }
  }

  const handleKeyDown = (e, r, c) => {
    if (e.key === 'Backspace' && !grid[r][c].char) {
      let prevR = r, prevC = c
      if (activeDirection === 'across') {
        prevC--
      } else {
        prevR--
      }

      if (prevR >= 0 && prevC >= 0 && !grid[prevR][prevC]?.isBlack) {
        inputRefs.current[`${prevR}-${prevC}`]?.focus()
        setActiveCell({ r: prevR, c: prevC })
      }
    } else if (e.key === 'ArrowRight') {
      setActiveDirection('across')
    } else if (e.key === 'ArrowDown') {
      setActiveDirection('down')
    }
  }

  const isCellHighlighted = (r, c) => {
    if (activeCell.r === r && activeCell.c === c) return true
    
    // Highlight the entire active word
    const cell = grid[r][c]
    if (!cell || cell.isBlack) return false
    
    // Check if this cell belongs to the same question the active cell belongs to in the active direction
    const activeCellData = grid[activeCell.r][activeCell.c]
    if (!activeCellData || !activeCellData.questions) return false
    
    const activeQuestions = activeCellData.questions
    return !!activeQuestions && questions.some(q => 
      activeQuestions.includes(q.questionId) && 
      q.gridDir === activeDirection && 
      cell.questions && cell.questions.includes(q.questionId)
    )
  }

  if (grid.length === 0) return null

  return (
    <div className="grid grid-cols-15 gap-0 border-[3px] border-[#00ADEF]/20 bg-white w-full max-w-[600px] shadow-xl mx-auto overflow-hidden rounded-lg">
      {grid.map((row, r) => (
        row.map((cell, c) => (
          <div 
            key={`${r}-${c}`}
            className={`
              relative aspect-square border-[0.5px] border-slate-100 transition-colors duration-200
              ${cell.isBlack ? 'bg-[#003B6E]' : 'bg-white'}
              ${!cell.isBlack && isCellHighlighted(r, c) ? 'bg-[#F0F9FF]' : ''}
              ${!cell.isBlack && activeCell.r === r && activeCell.c === c ? 'ring-2 ring-inset ring-[#00ADEF] z-10' : ''}
            `}
            style={{ backgroundColor: cell.isBlack ? '#003B6E' : undefined }}
          >
            {cell.num && (
              <span className="absolute top-0.5 left-1 text-[10px] font-bold text-slate-800 leading-none z-10">{cell.num}</span>
            )}
            {!cell.isBlack && (
              <input
                ref={el => inputRefs.current[`${r}-${c}`] = el}
                type="text"
                autoComplete="off"
                maxLength={1}
                value={cell.char}
                onChange={e => handleCharInput(r, c, e.target.value)}
                onKeyDown={e => handleKeyDown(e, r, c)}
                onFocus={() => {
                  setActiveCell({ r, c })
                  const cellQuestions = questions.filter(q => cell.questions.includes(q.questionId))
                  if (cellQuestions.length === 1) {
                    setActiveDirection(cellQuestions[0].gridDir)
                    if (onFocusQuestion) onFocusQuestion(cellQuestions[0].questionId)
                  } else if (cellQuestions.length > 1) {
                    const sameDirQ = cellQuestions.find(q => q.gridDir === activeDirection)
                    if (sameDirQ) {
                       if (onFocusQuestion) onFocusQuestion(sameDirQ.questionId)
                    } else {
                       setActiveDirection(cellQuestions[0].gridDir)
                       if (onFocusQuestion) onFocusQuestion(cellQuestions[0].questionId)
                    }
                  }
                }}
                className={`
                  w-full h-full text-center text-2xl font-black uppercase outline-none border-none transition-all duration-300
                  ${checkResults && cell.char 
                    ? (cell.char === cell.answer ? 'text-green-600 bg-green-100/80 shadow-inner' : 'text-red-600 bg-red-100/80 shadow-inner') 
                    : 'text-slate-900 bg-transparent'}
                `}
              />
            )}
          </div>
        ))
      ))}
    </div>
  )
}
