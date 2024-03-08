from mazelib import Maze
from mazelib.generate.Prims import Prims
from mazelib.solve.BacktrackingSolver import BacktrackingSolver
import matplotlib.pyplot as plt
import time
import json
import numpy as np

def showPNG(grid):
    """Generate a simple image of the maze."""
    plt.figure(figsize=(10, 5))
    plt.imshow(grid, cmap=plt.cm.binary, interpolation='nearest')
    plt.xticks([]), plt.yticks([])
    plt.show()

def toHTML(grid, start, end, cell_size=10):
    row_max = grid.shape[0]
    col_max = grid.shape[1]

    html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"' + \
           '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">' + \
           '<html xmlns="http://www.w3.org/1999/xhtml"><head>' + \
           '<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />' + \
           '<style type="text/css" media="screen">' + \
           '#maze {width: ' + str(cell_size * col_max) + 'px;height: ' + \
           str(cell_size * row_max) + 'px;border: 3px solid grey;}' + \
           'div.maze_row div{width: ' + str(cell_size) + 'px;height: ' + str(cell_size) + 'px;}' + \
           'div.maze_row div.bl{background-color: black;}' + \
           'div.maze_row div.wh{background-color: white;}' + \
           'div.maze_row div.rd{background-color: red;}' + \
           'div.maze_row div.gr{background-color: green;}' + \
           'div.maze_row div{float: left;}' + \
           'div.maze_row:after{content: ".";height: 0;visibility: hidden;display: block;clear: both;}' + \
           '</style></head><body>' + \
           '<div id="maze">'

    for row in range(row_max):
        html += '<div class="maze_row">'
        for col in range(col_max):
            if (row, col) == start:
                html += '<div class="gr"></div>'
            elif (row, col) == end:
                html += '<div class="rd"></div>'
            elif grid[row][col] == 1:
                html += '<div class="bl"></div>'
            elif grid[row][col] == 2:
                html += '<div class="rd"></div>'
            else:
                html += '<div class="wh"></div>'
        html += '</div>'
    html += '</div></body></html>'

    return html

m = Maze()
start = time.time()
m.generator = Prims(100, 100)
m.generate()
m.solver = BacktrackingSolver()
m.generate_entrances()
m.solve()
m.solvedGrid = np.copy(m.grid)
for (x, y) in m.solutions[0]:
    m.solvedGrid[x][y] = 2
end = time.time()
#showPNG(m.grid)
html = toHTML(m.grid, m.start, m.end)
f = open("maze.html", "w")
f.write(html)
f.close()
solvedhtml = toHTML(m.solvedGrid, m.start, m.end)
f = open("mazesolved.html", "w")
f.write(solvedhtml)
f.close()
endend = time.time()
pyList = m.grid.tolist()
index = 0
currentByte = 0
decimalBytes = []
for row in pyList:
    for bit in row:
        currentByte+=bit*(2**(7-(index%8)))
        if(index % 8 == 7):
            decimalBytes.append(currentByte)
            currentByte = 0
        index+=1


realBytes = bytes(decimalBytes)
f = open("mazeout.txt", "wb")
f.write(realBytes)
f.close()
print("generation: " + str(end - start))
print("toHTML: " + str(endend - end))
print("done")