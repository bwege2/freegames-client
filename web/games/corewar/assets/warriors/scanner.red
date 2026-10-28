;redcode-94
;name Scanner
;author the port's tests
;strategy a CMP scanner that drops a SPL/DAT clear on what it finds
;assert CORESIZE > 100
step    equ     98
gap     equ     12
        org     scan
ptr     dat     #0, #gap
scan    add     inc, ptr
        cmp.i   *ptr, @ptr
        slt.ab  #20, ptr
        djn.f   scan, <-200
        mov.ab  #gap+2, cnt
clr     mov.i   sbomb, >ptr
cnt     djn.b   clr, #0
        jmp     scan
inc     dat     #step, #step
sbomb   spl     #0, #0
        end
