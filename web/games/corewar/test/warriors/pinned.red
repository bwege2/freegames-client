;redcode-94
;name Pinned
;author the port's tests
;strategy shares P-space with every warrior of PIN 42; counts its rounds there
;assert 1
        pin     42
cnt     equ     5
start   ldp.ab  #cnt, slot
        add.ab  #1, slot
        stp.b   slot, #cnt
        stp.ab  #CURLINE, #cnt+1
        spl     #0, 0
        mov.i   {-1, >-1
slot    dat     #0, #0
        end     start
