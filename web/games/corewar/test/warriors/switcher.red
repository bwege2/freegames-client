;redcode-94
;name P-Switcher
;author the port's tests
;strategy keeps a strategy number in P-space and switches after a loss
;assert CORESIZE >= 800 && PSPACESIZE > 2
        org     think
state   equ     1
think   ldp.ab  #0, last
        ldp.ab  #state, mode
        sne.ab  #0, last
        add.ab  #1, mode
        mod.ab  #2, mode
        stp.b   mode, #state
        jmz.b   dwarf, mode
        jmp     imp
last    dat     #0, #0
mode    dat     #0, #0
dwarf   add.ab  #4, dbomb
        mov.i   dbomb, @dbomb
        jmp     dwarf
dbomb   dat     #0, #0
imp     spl     #0, 0
        mov.i   0, 2667
        end
