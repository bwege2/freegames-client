;redcode-94
;name Dwarf
;author A. K. Dewdney (1984); written down for the port's tests
;strategy bombs every fourth cell with a DAT
;assert CORESIZE % 4 == 0
        org     start
step    equ     4
bomb    dat     #0, #0
start   add     #step, bomb
        mov     bomb, @bomb
        jmp     start
        end
