;redcode-94
;name Stone
;author the port's tests
;strategy a mod-5 stone with a self-check and a core clear
;assert CORESIZE % 5 == 0
step    equ     3045
        org     go
go      spl     #0, <-10
loop    mov.i   bomb, @ptr
        add.f   inc, ptr
        djn.b   loop, #1000
clear   mov.i   dbomb, >ptr
        jmp     clear, <-5
ptr     dat     #step, #2*step
inc     dat     #step, #step
bomb    dat     >-1, }1
dbomb   dat     <1, <1
        end
