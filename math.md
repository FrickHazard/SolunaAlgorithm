
**Notation**

* A stack $S$ is a **tuple** $(H, C)$, where $H$ is the height of the stack and $C$ is the coloring of the stack

* A Game Board is defined as a finite **multiset** $G = \{ S_1, S_2, ... S_n \}$

* $M(G_\alpha)$ denotes the **set** of game boards reachable by $G_\alpha$, by the following two rules

1. Where $H(S_a) = H(S_b)$, $G_\beta = G_\alpha - \{ S_a, S_b \} \ + S(H(S_a) + H(S_b), C(S_a))$. We call $S_a$ the *top piece* as its coloring overwrites $S_b$

2. Where $C(S_a) = C(S_b)$, $G_\beta = G_\alpha - \{ S_a, S_b \} \ + S(H(S_a) + H(S_b), C(S_a))$. $S_a$.

* The Graph  $V(G)$ is the graph of all Game boards reachable by $M$ over $G$ .

* We define an initial game $I$ as any Game Board $G$ such that $\forall \ S \in G \ , \ H(S) = 1$.

* We define an end Game $E$ as any Game Board $G$ such that the cardinality of $M(G)$ is 0 ($M(G)$ is the empty set).

**Lemma 1**:  The graph $V$ of any $G$ is a finite DAG (Directed Acyclic Graph) and at most has a depth equal to the cardinality of $G$.

**Proof** Since $G$ is finite, and every Game Board  $G_\alpha \in M(G)$ has one less stack then $G$, then the graph $V$ has a depth no greater than the cardinalty of $G$, and additionaly must be acyclic since any node may only connect to game state with less nodes.


**Lemma 2**

$\forall \ G, \ G \in V(I) \implies |I| = \sum_{S\in G}H(S)$

Consider then


**Lemma 3**



**Proof**

**Lemma 3**

All End Game Boards $E$ can be represenetd as a *partition with distinct parts*, where every piece is colored differently.

**Lemma 4** For any Game Board $G$ from base $I$ the winner is equal $(|I| - |G|) \equiv \mod 2$, where $0$ is player $2$ wins.



We prove two types of move graph isomorphisms

**1.**

Symbol Irrelevance, Given a gameboard $A$, Consider any gameboard $B$ where every subset of symbol pieces are swapped with a different symbol such that no two subsets are switched with the same symbol.

Any move(edge) in $A$ is either a move onto a piece with the same height or a move onto a piece with the same symbol.

In either case a corresponding move may be made in $B$.

Left -> Heights are the identical between $A$ and $B$,
Right -> Any move onto the same symbol in $A$ will have a corresponding same symbol in $B$.

Thus their is an edge correspondance between $A$ and $B$.

By induction, any corresponding move(edge) between $A$ and $B$ applied, will result in two boards matching the criteria for corresponding edges, therefore $A \simeq B$


**2.**

$\forall \ G \ , \ V(G) \simeq V(G_\beta)$, where $G_\beta = \{ \ \ (H(S) \ /  \ \gcd(\{ \ H(S) \ | \ S \in G \ \}) \ , \ C(S)) \ | \ S \in G \ \}$.

In other words the graph $V$ of any Game Board $G$ is isomorphic to the same board where every stacks's height is divide by the gcd of all stack's heights.
**Proof**

Height Move: Since Every $S \in G_\beta$ has the same number $c = (\min(\{ \ H(S) \ | \ S \in G \ \}) -1)$, subtracted from its height, any height move in $G \implies$ a height move in $G_\beta$.

Color Move: As colors are unchanged this is trivial.

Therefore there is a $1-1$ correspondance between $M(G)$ and $M(G_\beta)$.

Now we must prove the induction step, Again the color move case is trivial as colors are identical.

For height moves consider the following, the corresponding height move $i$ of $M(G)_i$ and $M(G_\beta)_i$, the height of the new stack $H(\overline{S}_\beta)$ of $M(G_\beta)_i = H(\overline{S}) + 2c$, for the new stack $\overline{S}$ of $M(G)_i$.