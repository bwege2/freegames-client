;redcode
;name Dwarf '88
;author A. K. Dewdney (1984); written down for the port's tests
;assert CORESIZE % 4 == 0
bomb    dat     #0
dwarf   add     #4, bomb
        mov     bomb, @bomb
        jmp     dwarf
        end     dwarf
