# FBOracle: loaded into the oracle's perl (run.sh with ORACLE_PERL_MODULE=FBOracle) to add the game's
# state to the trace, next to the shim's frames and sounds:
#   R <ticks> srand <seed>                         every srand
#   G <ticks> <frame> <rand calls> <state> | <player> ... | ...   after every maingame() (one frame)
#   T <ticks> <kind> <surface> <x> <y> <size> <align> <text hex>     every print_ (SDL_Pango text) and
#                                                   every SDL::Surface::print (the editor's SFont text)
# and makes Data::Dumper sort hash keys, so the files the game writes have one fixed order. The port's
# harness (web/games/frozenbubble/test/harness.ts) writes the same lines.
package FBOracle;
use strict;
use warnings;
no warnings qw(redefine once);
use Data::Dumper;
$Data::Dumper::Sortkeys = 1;

our $rand_calls = 0;

BEGIN {
    *CORE::GLOBAL::rand = sub (;$) {
        $rand_calls++;
        return @_ ? CORE::rand($_[0]) : CORE::rand();
    };
    *CORE::GLOBAL::srand = sub (;$) {
        $rand_calls = 0;
        emit(sprintf('R %d srand %s', ticks(), defined $_[0] ? $_[0] : 'undef'));
        return @_ ? CORE::srand($_[0]) : CORE::srand();
    };
}

my $fh;
sub emit {
    my ($line) = @_;
    my $path = $ENV{ORACLE_STATE};
    return if !$path;
    if (!$fh) { open($fh, '>>', $path) or die "ORACLE_STATE: $!"; select((select($fh), $| = 1)[0]); }
    print $fh "$line\n";
}

sub ticks { defined &SDL::GetTicks ? SDL::GetTicks() : 0 }

sub g17 { my ($v) = @_; return '-' if !defined $v; return sprintf('%.17g', $v) }

sub hexs { my ($s) = @_; return '-' if !defined $s || $s eq ''; return unpack('H*', $s) }

sub surfname {
    my ($s) = @_;
    return 'app' if defined $main::app && $s == $main::app;
    return 'background' if defined $main::background && $s == $main::background;
    return 'other';
}

sub bubble_num {
    my ($b) = @_;
    return '-' if !$b;
    my $i = 0;
    foreach (@main::bubbles_images) { return $i if $_ eq $b->{img}; $i++ }
    return $b->{img} eq $main::bubbles_anim{lose} ? 'L' : '?';
}

sub player_state {
    my ($p) = @_;
    my $pd = $main::pdata{$p};
    my @s = sort { $a->[1] <=> $b->[1] || $a->[0] <=> $b->[0] } map { [ $_->{cx}, $_->{cy}, bubble_num($_) ] } @{$main::sticked_bubbles{$p} || []};
    my $l = $main::launched_bubble{$p};
    my @mb = map { join(',', $_->{cx}, $_->{stick_y}, g17($_->{y})) } @{$main::malus_bubble{$p} || []};
    my @fb = map { join(',', g17($_->{x}), g17($_->{y})) } @{$main::falling_bubble{$p} || []};
    my @eb = map { join(',', g17($_->{x}), g17($_->{y})) } @{$main::exploding_bubble{$p} || []};
    return join(' ', $p,
                "st=" . ($pd->{state} // '-'),
                "a=" . g17($main::angle{$p}),
                "b=" . join(';', map { "$_->[0],$_->[1],$_->[2]" } @s),
                "l=" . ($l ? join(',', g17($l->{x}), g17($l->{y}), g17($l->{direction}), bubble_num($l)) : '-'),
                "t=" . bubble_num($main::tobe_launched{$p}),
                "n=" . bubble_num($main::next_bubble{$p}),
                "m=" . scalar(@{$pd->{malus} || []}),
                "mb=" . join(';', @mb),
                "f=" . join(';', @fb),
                "c=" . scalar(grep { exists $_->{chaindestx} } @{$main::falling_bubble{$p} || []}),
                "e=" . join(';', @eb),
                "sc=" . ($pd->{score} // '-'),
                "nr=" . ($pd->{newroot} // '-'),
                "h=" . ($pd->{hurry} // '-'),
                "pg=" . ($pd->{ping_right}{state} // '-') . ',' . ($pd->{ping_right}{img} // '-'));
}

INIT {
    my $maingame = \&main::maingame;
    *main::maingame = sub {
        my @r = $maingame->(@_);
        emit(join(' | ', sprintf('G %d %d %d %s', ticks(), $main::frame, $rand_calls, $main::pdata{state} // '-'),
                  map { player_state($_) } @main::PLAYERS));
        return @r;
    };
    my $print_ = \&main::print_;
    *main::print_ = sub {
        my ($kind, $surface, $x, $y, $text, $size, $alignment) = @_;
        emit(sprintf('T %d %s %s %s %s %s %s %s', ticks(), $kind, surfname($surface), $x, $y,
                     defined $size ? $size : -1, defined $alignment ? $alignment : 'left', hexs($text)));
        return $print_->(@_);
    };
    if (defined &SDL::Surface::print) {
        my $sprint = \&SDL::Surface::print;
        *SDL::Surface::print = sub {
            my ($self, $x, $y, @text) = @_;
            emit(sprintf('T %d sfont %s %d %d -1 left %s', ticks(), surfname($self), $x, $y, hexs(join('', @text))));
            return $sprint->(@_);
        };
    }
}

1;
