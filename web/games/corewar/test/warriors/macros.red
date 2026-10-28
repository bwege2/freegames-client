;redcode-94
;name Macros
;author the port's tests
;strategy the preprocessor: multi-line EQU, FOR/ROF with counters and &, CURLINE, predefined constants
;version 1.0
;date today
;assert VERSION >= 80 && WARRIORS >= 1 && MAXLENGTH >= 40 && ROUNDS > 0
;assert MAXPROCESSES > 0 && MAXCYCLES > 0 && MINDISTANCE >= MAXLENGTH && READLIMIT == CORESIZE
setup   equ     spl 1
        equ     spl 1
dist    equ     (CORESIZE/4+1)
x       equ     3*(2+1)
        setup
i       for     4
lbl&i   dat     #i, #CURLINE
        rof
j       for     2
k       for     j+1
        dat     #j*10+k, #(j==k) || (j>k) && 1
        rof
        rof
        for     0
        this    is    skipped
        rof
go      mov.i   lbl01, dist
        mov.i   lbl02, dist+x
        add.f   #-1+2*-3, @go
        sub.x   #x%7, go
        mul.ab  #3, go
        div.ba  #2, go
        mod.f   >go, <go
        seq.i   *go, {go
        sne.i   }go, *go
        nop     go, go
        jmn.f   go, >lbl04
        jmz.x   go, go
        djn.i   go, }go
        slt.ba  #100, go
        cmp.x   go, go
        jmp     go
        end     go
